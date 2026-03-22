import { NextResponse } from 'next/server';
import { createContactSubmission } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase';
import { isValidEmail, sanitizeText } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { sendNotification, cateringNotificationEmail } from '@/lib/email';
import { syncLeadToSquare } from '@/lib/square';

export async function POST(request: Request) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rl = checkRateLimit(`catering:${ip}`, RATE_LIMITS.form);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, eventDate, guestCount, eventType, dietaryRestrictions, notes } = body;

    // Validate required fields
    if (!name || !email || !phone || !eventDate || !guestCount || !eventType) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    // Validate email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Validate guest count (use parseInt to reject scientific notation/floats)
    const guestCountNum = parseInt(String(guestCount), 10);
    if (isNaN(guestCountNum) || !Number.isFinite(guestCountNum) || guestCountNum < 10 || guestCountNum > 10000) {
      return NextResponse.json(
        { success: false, message: 'Guest count must be between 10 and 10,000.' },
        { status: 400 }
      );
    }

    // Validate event date format and ensure it's in the future
    const dateStr = String(eventDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid date (YYYY-MM-DD).' },
        { status: 400 }
      );
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid event date.' },
        { status: 400 }
      );
    }
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (dateStr <= todayStr) {
      return NextResponse.json(
        { success: false, message: 'Event date must be in the future.' },
        { status: 400 }
      );
    }

    // Format catering details into message
    const message = [
      `Event Type: ${sanitizeText(eventType, 200)}`,
      `Event Date: ${eventDate}`,
      `Guest Count: ${guestCountNum}`,
      `Phone: ${sanitizeText(phone, 30)}`,
      dietaryRestrictions ? `Dietary Restrictions: ${sanitizeText(dietaryRestrictions, 500)}` : null,
      notes ? `Additional Notes: ${sanitizeText(notes, 1000)}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const serviceClient = createServiceRoleClient();
    await createContactSubmission({
      name: sanitizeText(name, 200),
      email: email.toLowerCase().trim(),
      subject: 'Catering',
      message,
    }, serviceClient);

    // Notify admin
    const notif = cateringNotificationEmail({
      name: sanitizeText(name, 200),
      email: email.toLowerCase().trim(),
      phone: sanitizeText(phone, 30),
      eventDate,
      guestCount: guestCountNum,
      eventType: sanitizeText(eventType, 200),
      notes: notes ? sanitizeText(notes, 1000) : undefined,
    });
    sendNotification(notif.subject, notif.html);

    // Sync lead to Square (fire-and-forget)
    syncLeadToSquare({
      email: email.toLowerCase().trim(),
      name: sanitizeText(name, 200),
      phone: sanitizeText(phone, 30),
      note: `Catering: ${sanitizeText(eventType, 200)}, ${guestCountNum} guests, ${eventDate}`,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Thank you for your catering inquiry! We\'ll be in touch within 24 hours.',
    });
  } catch (err: unknown) {
    console.error('[catering] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
