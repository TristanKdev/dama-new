'use client';

import { useState, useEffect } from 'react';

const COLOR_MAP: Record<string, { bg: string; text: string; close: string }> = {
  green: { bg: 'bg-dama-green-600', text: 'text-white', close: 'text-white/70 hover:text-white' },
  amber: { bg: 'bg-amber-500', text: 'text-white', close: 'text-white/70 hover:text-white' },
  red: { bg: 'bg-red-600', text: 'text-white', close: 'text-white/70 hover:text-white' },
  blue: { bg: 'bg-blue-600', text: 'text-white', close: 'text-white/70 hover:text-white' },
  charcoal: { bg: 'bg-dama-charcoal', text: 'text-dama-cream', close: 'text-dama-cream/70 hover:text-dama-cream' },
};

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<{ text: string; color: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/settings/announcement')
      .then((r) => r.json())
      .then((data) => {
        if (data.active && data.text) {
          setAnnouncement({ text: data.text, color: data.color || 'green' });
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement || dismissed) return null;

  const colors = COLOR_MAP[announcement.color] || COLOR_MAP.green;

  return (
    <div className={`${colors.bg} relative`}>
      <div className="mx-auto max-w-7xl px-4 py-2.5 text-center">
        <p className={`text-xs font-medium tracking-wide ${colors.text} sm:text-sm`}>
          {announcement.text}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.close}`}
        aria-label="Dismiss announcement"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}
