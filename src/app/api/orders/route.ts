import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase';
import { getSquareClient } from '@/lib/square';
import { isValidEmail, isValidDeliveryMethod, isValidPhone, isValidDateString, sanitizeText } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail, sendNotification, orderConfirmationEmail, newOrderAdminEmail } from '@/lib/email';
import { syncLeadToSquare } from '@/lib/square';
import { DELIVERY } from '@/lib/constants';

const MAX_ITEM_QUANTITY = 99;

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(`orders:${ip}`, RATE_LIMITS.payment);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      customerName, customerEmail, customerPhone,
      deliveryDate, deliveryMethod, deliveryAddress,
      notes, paymentReference, userId, items,
      promoCode,
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !deliveryDate || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email
    if (!isValidEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate phone
    if (!isValidPhone(customerPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Validate delivery method
    if (!isValidDeliveryMethod(deliveryMethod)) {
      return NextResponse.json(
        { error: 'Invalid delivery method' },
        { status: 400 }
      );
    }

    // Validate delivery date format and ensure it's in the future
    if (!isValidDateString(deliveryDate)) {
      return NextResponse.json(
        { error: 'Invalid delivery date format' },
        { status: 400 }
      );
    }
    const deliveryDateObj = new Date(deliveryDate + 'T23:59:59Z');
    if (deliveryDateObj <= new Date()) {
      return NextResponse.json(
        { error: 'Delivery date must be in the future' },
        { status: 400 }
      );
    }

    // Require delivery address for building delivery
    if (deliveryMethod === 'building-delivery' && !deliveryAddress) {
      return NextResponse.json(
        { error: 'Delivery address is required for building delivery' },
        { status: 400 }
      );
    }

    // Note: deliveryFee is not read from client — recomputed server-side below

    // Validate items array (including server-side quantity max)
    for (const item of items) {
      if (!item.menuItemId || !item.menuItemName || !item.quantity ||
          typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) ||
          item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY ||
          typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        return NextResponse.json(
          { error: 'Invalid item data' },
          { status: 400 }
        );
      }
    }

    // Use service role client to bypass RLS (server-side trusted operation)
    const serviceClient = createServiceRoleClient();

    // Verify menu item prices server-side to prevent price tampering
    const menuItemIds = items.map((i: { menuItemId: string }) => i.menuItemId);
    const { data: menuRows, error: menuError } = await serviceClient
      .from('menu_items')
      .select('id, price, available, sold_out')
      .in('id', menuItemIds);

    if (menuError) {
      return NextResponse.json({ error: 'Failed to verify menu items' }, { status: 500 });
    }

    const priceMap = new Map<string, number>();
    for (const row of menuRows ?? []) {
      if (!row.available || row.sold_out) {
        return NextResponse.json(
          { error: `"${row.id}" is no longer available` },
          { status: 400 }
        );
      }
      priceMap.set(row.id, row.price);
    }

    // Ensure all items exist in the menu
    for (const item of items) {
      if (!priceMap.has(item.menuItemId)) {
        return NextResponse.json(
          { error: `Menu item "${item.menuItemId}" not found` },
          { status: 400 }
        );
      }
    }

    // Compute server-side totals using integer cents to avoid floating-point issues
    let verifiedSubtotalCents = 0;
    const verifiedItems: { menuItemId: string; menuItemName: string; quantity: number; unitPrice: number; subtotal: number }[] = [];
    for (const item of items) {
      const serverPrice = priceMap.get(item.menuItemId);
      if (serverPrice === undefined) {
        return NextResponse.json({ error: 'Item price verification failed' }, { status: 400 });
      }
      const serverPriceCents = Math.round(serverPrice * 100);
      const itemSubtotalCents = serverPriceCents * item.quantity;
      verifiedSubtotalCents += itemSubtotalCents;
      verifiedItems.push({
        ...item,
        unitPrice: serverPrice,
        subtotal: itemSubtotalCents / 100,
      });
    }
    // Enforce minimum order amount
    const verifiedSubtotalDollars = verifiedSubtotalCents / 100;
    if (verifiedSubtotalDollars < DELIVERY.minimumOrder) {
      return NextResponse.json(
        { error: `Minimum order is $${DELIVERY.minimumOrder}` },
        { status: 400 }
      );
    }

    // Recompute delivery fee server-side (don't trust client value)
    let computedDeliveryFee = 0;
    if (deliveryMethod === 'building-delivery') {
      computedDeliveryFee = verifiedSubtotalDollars >= DELIVERY.freeDeliveryMinimum
        ? 0
        : DELIVERY.deliveryFee;
    }
    const deliveryFeeCents = Math.round(computedDeliveryFee * 100);

    // Server-side promo code validation
    let promoDiscountCents = 0;
    if (promoCode && typeof promoCode === 'string') {
      const sanitizedCode = sanitizeText(promoCode.toUpperCase().trim(), 50);
      const { data: promo } = await serviceClient
        .from('promo_codes')
        .select('*')
        .eq('code', sanitizedCode)
        .eq('active', true)
        .maybeSingle();

      if (promo) {
        const notExpired = !promo.expires_at || new Date(promo.expires_at) >= new Date();
        const notExhausted = !promo.max_uses || promo.current_uses < promo.max_uses;
        const meetsMinimum = !promo.min_order_amount || (verifiedSubtotalCents / 100) >= promo.min_order_amount;

        if (notExpired && notExhausted && meetsMinimum) {
          // Atomic increment: only succeeds if current_uses hasn't changed (optimistic lock)
          const { data: updated } = await serviceClient
            .from('promo_codes')
            .update({ current_uses: promo.current_uses + 1 })
            .eq('id', promo.id)
            .eq('current_uses', promo.current_uses)
            .select('id');

          if (updated && updated.length > 0) {
            // Successfully claimed the promo — apply discount
            if (promo.discount_type === 'percent') {
              promoDiscountCents = Math.round(verifiedSubtotalCents * (promo.discount_value / 100));
            } else {
              promoDiscountCents = Math.round(promo.discount_value * 100);
            }
            // Cap discount to subtotal — discount should never exceed what the customer ordered
            if (promoDiscountCents > verifiedSubtotalCents) {
              promoDiscountCents = verifiedSubtotalCents;
            }
          }
          // If no rows updated, another request used it first — silently skip discount
        }
      }
      // If promo is invalid/expired, we just don't apply a discount (no error —
      // the payment amount check below will catch any mismatch)
    }

    const verifiedTotalCents = Math.max(0, verifiedSubtotalCents + deliveryFeeCents - promoDiscountCents);
    const verifiedSubtotal = verifiedSubtotalCents / 100;
    const verifiedTotal = verifiedTotalCents / 100;

    // Allow $0 orders (100% promo discount) without payment
    if (verifiedTotalCents === 0 && (!paymentReference || paymentReference === 'free-order')) {
      // No payment needed — skip verification
    } else if (!paymentReference || paymentReference === 'free-order') {
      // Non-zero total requires a real payment reference
      return NextResponse.json(
        { error: 'Payment is required' },
        { status: 400 }
      );
    }

    // Verify payment amount matches order total (prevents underpayment)
    if (paymentReference && paymentReference !== 'free-order') {
      try {
        const squareClient = getSquareClient();
        const paymentResponse = await Promise.race([
          squareClient.payments.get(paymentReference),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Payment verification timed out')), 15000)
          ),
        ]);
        const payment = paymentResponse.payment;
        if (!payment || !payment.amountMoney?.amount) {
          return NextResponse.json(
            { error: 'Could not verify payment details' },
            { status: 500 }
          );
        }
        if (payment.status === 'FAILED' || payment.status === 'CANCELED') {
          return NextResponse.json(
            { error: 'Payment was not successful' },
            { status: 400 }
          );
        }
        const paidCents = Number(payment.amountMoney.amount);
        if (isNaN(paidCents) || paidCents !== verifiedTotalCents) {
          return NextResponse.json(
            { error: 'Payment amount does not match order total' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: 'Could not verify payment' },
          { status: 500 }
        );
      }
    }

    // Verify building eligibility for building delivery
    if (deliveryMethod === 'building-delivery' && deliveryAddress) {
      const normalizedAddr = deliveryAddress.toLowerCase().trim();
      const { data: buildings } = await serviceClient
        .from('eligible_buildings')
        .select('name, address')
        .eq('active', true);

      const isEligible = (buildings ?? []).some((b: { name: string; address: string }) => {
        const bAddr = b.address.toLowerCase();
        const bName = b.name.toLowerCase();
        // Require the full building address or name to appear in the input
        // (not the other way around — prevents "5" matching "55 Main St")
        return normalizedAddr.includes(bAddr) || normalizedAddr.includes(bName);
      });

      if (!isEligible) {
        return NextResponse.json(
          { error: 'Delivery address is not in an eligible building' },
          { status: 400 }
        );
      }
    }

    const orderId = await createOrder({
      customerName: sanitizeText(customerName, 200),
      customerEmail: customerEmail.toLowerCase().trim(),
      customerPhone: sanitizeText(customerPhone, 30),
      deliveryDate,
      deliveryMethod,
      deliveryAddress: deliveryAddress ? sanitizeText(deliveryAddress, 500) : undefined,
      subtotal: verifiedSubtotal,
      deliveryFee: computedDeliveryFee,
      total: verifiedTotal,
      notes: notes ? sanitizeText(notes, 500) : undefined,
      paymentReference,
      userId: userId || undefined,
      items: verifiedItems,
    }, serviceClient);

    // Send confirmation email to customer (fire-and-forget)
    const emailData = orderConfirmationEmail({
      id: orderId,
      customerName: sanitizeText(customerName, 200),
      deliveryDate,
      deliveryMethod,
      total: verifiedTotal,
      items: verifiedItems,
    });
    sendEmail({ to: customerEmail.toLowerCase().trim(), ...emailData }).catch(() => {});

    // Notify admin of new order (fire-and-forget)
    const adminOrderData = newOrderAdminEmail({
      id: orderId,
      customerName: sanitizeText(customerName, 200),
      total: verifiedTotal,
      deliveryDate,
      deliveryMethod,
      itemCount: verifiedItems.length,
    });
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      sendEmail({ to: adminEmail, ...adminOrderData }).catch(() => {});
    }
    sendNotification(adminOrderData.subject, adminOrderData.html);

    // Sync customer to Square (fire-and-forget)
    syncLeadToSquare({
      email: customerEmail.toLowerCase().trim(),
      name: sanitizeText(customerName, 200),
      phone: customerPhone,
      note: `Order: ${orderId.slice(0, 8).toUpperCase()}`,
    }).catch(() => {});

    return NextResponse.json({ orderId });
  } catch (err: unknown) {
    console.error('[orders] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
