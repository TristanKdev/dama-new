import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Use Eastern Time (America/New_York) for all cutoff calculations
// since the business operates in Jersey City, NJ.
function nowET(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`delivery-dates:${ip}`, RATE_LIMITS.publicRead);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const db = createServiceRoleClient();

    // Fetch active delivery days and blackout dates in parallel
    const [scheduleResult, blackoutResult] = await Promise.all([
      db.from('delivery_schedule').select('day_of_week, cutoff_hours_before').eq('active', true),
      db.from('delivery_blackout_dates').select('blackout_date')
        .gte('blackout_date', new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date())),
    ]);

    const activeDays = (scheduleResult.data ?? []).map((d: { day_of_week: number; cutoff_hours_before: number }) => ({
      dayOfWeek: d.day_of_week,
      cutoffHours: d.cutoff_hours_before,
    }));

    const blackoutDates = new Set(
      (blackoutResult.data ?? []).map((d: { blackout_date: string }) => d.blackout_date)
    );

    // Generate next 28 days of delivery dates
    const dates: {
      date: string;
      dayOfWeek: string;
      available: boolean;
      cutoffTime: string;
    }[] = [];

    const now = nowET();

    for (let i = 1; i <= 28; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dayNum = d.getDay();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const schedule = activeDays.find((s: { dayOfWeek: number }) => s.dayOfWeek === dayNum);
      if (!schedule) continue;

      // Check cutoff in ET: anchor at midnight of delivery date, then subtract cutoff hours.
      // e.g., if cutoffHours=24 and delivery is Thursday, cutoff = Wednesday midnight (12:00 AM).
      const cutoff = new Date(d);
      cutoff.setHours(0, 0, 0, 0); // midnight of delivery date
      cutoff.setHours(cutoff.getHours() - schedule.cutoffHours);
      const available = now < cutoff && !blackoutDates.has(dateStr);

      dates.push({
        date: dateStr,
        dayOfWeek: DAY_NAMES[dayNum],
        available,
        cutoffTime: `${schedule.cutoffHours}h before`,
      });
    }

    return NextResponse.json({ dates });
  } catch (err: unknown) {
    console.error('[delivery-dates] Error:', err instanceof Error ? err.message : err);
    // Fallback: return empty — frontend will use static data
    return NextResponse.json({ dates: [] });
  }
}
