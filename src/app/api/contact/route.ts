import { NextResponse } from 'next/server';
import { createContactSubmission } from '@/lib/queries';
import { createServiceRoleClient } from '@/lib/supabase';
import { isValidEmail, sanitizeText } from '@/lib/validation';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { sendEmail, sendNotification, contactConfirmationEmail, contactNotificationEmail } from '@/lib/email';
import { syncLeadToSquare } from '@/lib/square';

export async function POST(request: Request) {
  try {
    // Rate limit to prevent spam
    const ip = getClientIp(request);
    const rl = checkRateLimit(`contact:${ip}`, RATE_LIMITS.form);
    if (!rl.success) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Sanitize and length-check inputs
    const sanitizedName = sanitizeText(name, 200);
    const sanitizedSubject = sanitizeText(subject, 300);
    const sanitizedMessage = sanitizeText(message, 5000);

    if (!sanitizedName || !sanitizedSubject || !sanitizedMessage) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Use service role client (contact_submissions only allows INSERT via anon, but service role is safer)
    const serviceClient = createServiceRoleClient();
    await createContactSubmission({
      name: sanitizedName,
      email: email.toLowerCase().trim(),
      subject: sanitizedSubject,
      message: sanitizedMessage,
    }, serviceClient);

    // Send confirmation email to customer (fire-and-forget)
    const emailData = contactConfirmationEmail(name);
    sendEmail({ to: email.toLowerCase().trim(), ...emailData }).catch(() => {});

    // Notify admin
    const notif = contactNotificationEmail({ name: sanitizedName, email: email.toLowerCase().trim(), subject: sanitizedSubject, message: sanitizedMessage });
    sendNotification(notif.subject, notif.html);

    // Sync lead to Square (fire-and-forget)
    syncLeadToSquare({ email: email.toLowerCase().trim(), name: sanitizedName, note: `Contact: ${sanitizedSubject}` }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
    });
  } catch (err: unknown) {
    console.error('[contact] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
