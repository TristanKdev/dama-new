import Link from 'next/link';
import Image from 'next/image';
import { BUSINESS, SOCIAL, FOOTER_NAV } from '@/lib/constants';
import { NewsletterForm } from './NewsletterForm';

export function Footer() {
  return (
    <footer className="bg-dama-black text-dama-cream" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo/logo-white.png"
                alt="DAM:A"
                width={120}
                height={40}
                className="h-10 w-auto"
                style={{ width: 'auto', height: 'auto' }}
              />
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-dama-cream/60">
              {BUSINESS.description}
            </p>
            <div className="mt-5 flex gap-4">
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dama-cream/50 transition-colors hover:text-dama-green-400"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="16" height="16" rx="4" />
                  <circle cx="10" cy="10" r="4" />
                  <circle cx="15" cy="5" r="0.5" fill="currentColor" />
                </svg>
              </a>
              <a
                href={SOCIAL.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dama-cream/50 transition-colors hover:text-dama-green-400"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2H2v16h7v-6H7v-2h2V8a3 3 0 0 1 3-3h2v2h-2a1 1 0 0 0-1 1v2h3l-.5 2H11v6h7V2z" />
                </svg>
              </a>
              <a
                href={SOCIAL.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dama-cream/50 transition-colors hover:text-dama-green-400"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2v12a3 3 0 1 1-3-3" />
                  <path d="M9 5c2 0 4 1.5 5 3V2" />
                </svg>
              </a>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium text-white/70">Stay in the loop</p>
              <NewsletterForm />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-dama-cream/40">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dama-cream/60 transition-colors hover:text-dama-green-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-dama-cream/40">
              Contact
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV.contact.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dama-cream/60 transition-colors hover:text-dama-green-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="text-sm text-dama-cream/60 transition-colors hover:text-dama-green-400"
                >
                  {BUSINESS.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BUSINESS.phone.replace(/[^+\d]/g, '')}`}
                  className="text-sm text-dama-cream/60 transition-colors hover:text-dama-green-400"
                >
                  {BUSINESS.phone}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-dama-cream/40">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_NAV.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-dama-cream/60 transition-colors hover:text-dama-green-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-dama-cream/50">
              &copy; {new Date().getFullYear()} DAM:A. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-dama-cream/10 bg-dama-black py-4">
        <p className="text-center text-xs text-dama-cream/50">
          Powered by{' '}
          <a
            href="https://onyxxmediagroup.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dama-cream/50 transition-colors hover:text-dama-green-400"
          >
            Onyxx Media Group
          </a>
        </p>
      </div>
    </footer>
  );
}
