// Email service using Resend API
// To activate: set RESEND_API_KEY env var

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const NOTIFICATION_EMAILS = ['Klushllc@gmail.com', 'ads@onyxxmediagroup.com'];

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendNotification(subject: string, html: string): Promise<void> {
  for (const to of NOTIFICATION_EMAILS) {
    sendEmail({ to, subject, html }).catch(() => {});
  }
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Email not configured — skip silently in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Email Skipped] To: ${options.to}, Subject: ${options.subject}`);
    }
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'DAM:A <noreply@damajc.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => 'unknown');
      console.error(`[email] Failed to send to ${options.to}: ${res.status} ${errorBody}`);
    }
    return res.ok;
  } catch (err: unknown) {
    console.error(`[email] Error sending to ${options.to}:`, err instanceof Error ? err.message : err);
    return false;
  }
}

// ── Email wrapper ──

function emailWrapper(content: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#3D3830">
      <div style="text-align:center;margin-bottom:24px">
        <span style="font-size:20px;font-weight:700;color:#2F5233;letter-spacing:1px">DAM:A</span>
      </div>
      ${content}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e8e4dc;text-align:center">
        <p style="color:#999;font-size:11px;margin:0">DAM:A — Korean Banchan, Delivered</p>
        <p style="color:#999;font-size:11px;margin:4px 0 0">Jersey City, NJ &middot; hello@damajc.com</p>
      </div>
    </div>
  `;
}

// ── Order emails ──

export function orderConfirmationEmail(order: {
  id: string;
  customerName: string;
  deliveryDate: string;
  deliveryMethod: string;
  total: number;
  items: { menuItemName: string; quantity: number; subtotal: number }[];
}): { subject: string; html: string } {
  const formattedDate = new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const itemRows = order.items
    .map(i => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ece4;font-size:14px">${escapeHtml(i.menuItemName)} &times; ${i.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #f0ece4;text-align:right;font-size:14px">$${i.subtotal.toFixed(2)}</td></tr>`)
    .join('');

  return {
    subject: `Order Confirmed — ${order.id.slice(0, 8).toUpperCase()}`,
    html: emailWrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">Order Confirmed!</h1>
      <p style="color:#666;margin:0 0 16px;font-size:14px">Hi ${escapeHtml(order.customerName)}, thank you for your order.</p>
      <div style="background:#f9f8f5;border-radius:8px;padding:16px;margin:0 0 16px">
        <p style="margin:0;font-size:13px;color:#888">Order #${order.id.slice(0, 8).toUpperCase()}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">${order.deliveryMethod === 'building-delivery' ? 'Delivery' : 'Pickup'} on ${formattedDate}</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        ${itemRows}
        <tr><td style="padding:12px 0;font-weight:600;font-size:15px">Total</td><td style="padding:12px 0;font-weight:600;text-align:right;font-size:15px">$${order.total.toFixed(2)}</td></tr>
      </table>
    `),
  };
}

export function orderStatusEmail(order: {
  id: string;
  customerName: string;
  status: string;
  deliveryDate: string;
}): { subject: string; html: string } {
  const statusMessages: Record<string, string> = {
    confirmed: 'Your order has been confirmed and will be prepared soon.',
    preparing: 'Your order is now being prepared with care.',
    'out-for-delivery': 'Your order is on its way! Look out for our delivery.',
    delivered: 'Your order has been delivered. Enjoy your meal!',
    cancelled: 'Your order has been cancelled. If you have questions, please contact us.',
  };

  const statusLabels: Record<string, string> = {
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    'out-for-delivery': 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const message = statusMessages[order.status] || 'Your order status has been updated.';
  const label = statusLabels[order.status] || 'Updated';

  return {
    subject: `Order ${label} — ${order.id.slice(0, 8).toUpperCase()}`,
    html: emailWrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">Order ${label}</h1>
      <p style="color:#666;margin:0 0 16px;font-size:14px">Hi ${escapeHtml(order.customerName)}, ${message}</p>
      <div style="background:#f9f8f5;border-radius:8px;padding:16px">
        <p style="margin:0;font-size:13px;color:#888">Order #${order.id.slice(0, 8).toUpperCase()}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">Delivery date: ${new Date(order.deliveryDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>
    `),
  };
}

// ── Contact emails ──

export function contactConfirmationEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'We received your message — DAM:A',
    html: emailWrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">Message Received</h1>
      <p style="color:#666;margin:0;font-size:14px">Hi ${escapeHtml(name)}, we've received your message and will get back to you within 24 hours.</p>
    `),
  };
}

// ── Subscription emails ──

export function subscriptionConfirmationEmail(sub: {
  customerName: string;
  planName: string;
  frequency: string;
  deliveryDay: string;
  nextDeliveryDate: string;
}): { subject: string; html: string } {
  const formattedDate = new Date(sub.nextDeliveryDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return {
    subject: `Subscription Started — ${sub.planName}`,
    html: emailWrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">Welcome to DAM:A!</h1>
      <p style="color:#666;margin:0 0 16px;font-size:14px">Hi ${escapeHtml(sub.customerName)}, your subscription is all set.</p>
      <div style="background:#f9f8f5;border-radius:8px;padding:16px">
        <p style="margin:0;font-size:14px;font-weight:600;color:#3D3830">${escapeHtml(sub.planName)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">${sub.frequency} delivery every ${sub.deliveryDay}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">First delivery: ${formattedDate}</p>
      </div>
    `),
  };
}

// ── Admin notification emails ──

export function contactNotificationEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): { subject: string; html: string } {
  return {
    subject: `New Contact Inquiry — ${escapeHtml(data.subject)}`,
    html: emailWrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">New Contact Form Submission</h1>
      <div style="background:#f9f8f5;border-radius:8px;padding:16px;margin:0 0 16px">
        <p style="margin:0;font-size:14px;font-weight:600;color:#3D3830">${escapeHtml(data.name)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">Email: ${escapeHtml(data.email)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">Subject: ${escapeHtml(data.subject)}</p>
      </div>
      <div style="background:#fff;border:1px solid #e8e4dc;border-radius:8px;padding:16px">
        <p style="margin:0;font-size:14px;color:#3D3830;white-space:pre-wrap">${escapeHtml(data.message)}</p>
      </div>
    `),
  };
}

export function cateringNotificationEmail(data: {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  guestCount: number;
  eventType: string;
  notes?: string;
}): { subject: string; html: string } {
  return {
    subject: `New Catering Inquiry — ${escapeHtml(data.eventType)} (${data.guestCount} guests)`,
    html: emailWrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">New Catering Request</h1>
      <div style="background:#f9f8f5;border-radius:8px;padding:16px;margin:0 0 16px">
        <p style="margin:0;font-size:14px;font-weight:600;color:#3D3830">${escapeHtml(data.name)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">Email: ${escapeHtml(data.email)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">Phone: ${escapeHtml(data.phone)}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#888">Event: ${escapeHtml(data.eventType)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">Date: ${data.eventDate}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">Guests: ${data.guestCount}</p>
        ${data.notes ? `<p style="margin:8px 0 0;font-size:13px;color:#888">Notes: ${escapeHtml(data.notes)}</p>` : ''}
      </div>
    `),
  };
}

export function newsletterNotificationEmail(email: string): { subject: string; html: string } {
  return {
    subject: 'New Newsletter Subscriber',
    html: emailWrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">New Newsletter Signup</h1>
      <div style="background:#f9f8f5;border-radius:8px;padding:16px">
        <p style="margin:0;font-size:14px;color:#3D3830">${escapeHtml(email)}</p>
      </div>
    `),
  };
}

export function newOrderAdminEmail(order: {
  id: string;
  customerName: string;
  total: number;
  deliveryDate: string;
  deliveryMethod: string;
  itemCount: number;
}): { subject: string; html: string } {
  return {
    subject: `New Order — ${order.id.slice(0, 8).toUpperCase()} ($${order.total.toFixed(2)})`,
    html: emailWrapper(`
      <h1 style="font-size:22px;margin:0 0 8px">New Order Received</h1>
      <div style="background:#f9f8f5;border-radius:8px;padding:16px;margin:0 0 16px">
        <p style="margin:0;font-size:14px;font-weight:600;color:#3D3830">${escapeHtml(order.customerName)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">Order #${order.id.slice(0, 8).toUpperCase()} &middot; ${order.itemCount} item${order.itemCount !== 1 ? 's' : ''}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">${order.deliveryMethod === 'building-delivery' ? 'Delivery' : 'Pickup'} on ${order.deliveryDate}</p>
        <p style="margin:8px 0 0;font-size:16px;font-weight:600;color:#2F5233">$${order.total.toFixed(2)}</p>
      </div>
    `),
  };
}
