'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { SOCIAL } from '@/lib/constants';

const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    href: SOCIAL.instagram,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: SOCIAL.facebook,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: SOCIAL.tiktok,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.84 4.84 0 01-1-.11z" />
      </svg>
    ),
  },
];

export function SocialPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('dama-social-shown')) return;

    function handleScroll() {
      const scrollPercent =
        window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.5) {
        setOpen(true);
        sessionStorage.setItem('dama-social-shown', '1');
        window.removeEventListener('scroll', handleScroll);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">
          Stay Connected
        </p>
        <h2 className="mt-2 font-cormorant text-2xl font-semibold text-dama-charcoal">
          Follow Us on Social Media!
        </h2>
        <p className="mt-2 text-sm text-dama-charcoal/60">
          Get the latest updates on new dishes, seasonal specials, and more.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-lg p-3 text-dama-charcoal/70 transition-colors hover:bg-dama-green-50 hover:text-dama-green-600"
            >
              {link.icon}
              <span className="text-xs font-medium">{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    </Modal>
  );
}
