'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { user, isAdmin, signOut } = useAuth();
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-white shadow-xl transition-[transform,visibility] duration-300 ease-in-out lg:hidden',
          open ? 'visible translate-x-0' : 'invisible translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-dama-sand px-6 py-4">
          <span className="font-cormorant text-xl font-bold text-dama-charcoal">DAM:A</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-dama-sand/50"
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-6 py-6" aria-label="Mobile navigation">
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="block rounded-md px-3 py-3 text-base font-medium text-dama-charcoal transition-colors hover:bg-dama-green-50 hover:text-dama-green-600"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                onClick={onClose}
                className="block rounded-md px-3 py-3 text-base font-medium text-dama-charcoal transition-colors hover:bg-dama-green-50 hover:text-dama-green-600"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/delivery-areas"
                onClick={onClose}
                className="block rounded-md px-3 py-3 text-base font-medium text-dama-charcoal transition-colors hover:bg-dama-green-50 hover:text-dama-green-600"
              >
                Delivery Areas
              </Link>
            </li>
          </ul>
        </nav>

        <div className="border-t border-dama-sand px-6 py-6 space-y-3">
          {user ? (
            <>
              <Link
                href="/account"
                onClick={onClose}
                className="block rounded-md border border-dama-sand px-3 py-3 text-center text-sm font-medium text-dama-charcoal transition-colors hover:bg-dama-green-50"
              >
                My Account
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="block rounded-md border border-dama-sand px-3 py-3 text-center text-sm font-medium text-dama-green-600 transition-colors hover:bg-dama-green-50"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => { signOut(); onClose(); }}
                className="w-full rounded-md border border-dama-sand px-3 py-3 text-center text-sm font-medium text-dama-charcoal/50 transition-colors hover:bg-red-50 hover:text-dama-error"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="block rounded-md border border-dama-sand px-3 py-3 text-center text-sm font-medium text-dama-charcoal transition-colors hover:bg-dama-green-50"
            >
              Log In / Sign Up
            </Link>
          )}
          <Link
            href="/menu"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-md bg-dama-green-500 py-3 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:bg-dama-green-600"
          >
            Order Now
          </Link>
        </div>
      </div>
    </>
  );
}
