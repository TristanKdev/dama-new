'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { useAuth } from '@/context/AuthContext';
import { NAV_LINKS_PRIMARY } from '@/lib/constants';
import { MobileMenu } from './MobileMenu';
import { cn } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const openCart = useCartStore((s) => s.openCart);
  const itemCount = useCartStore((s) => s.getItemCount)();
  const { user, isAdmin } = useAuth();

  // Rehydrate cart from localStorage after mount (skipHydration is enabled
  // on the store to prevent SSR/client mismatch during React hydration)
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 100);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 border-b border-dama-sand bg-dama-cream transition-all duration-300',
          scrolled && 'bg-dama-cream/95 backdrop-blur-md'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-[72px] lg:px-6 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="DAM:A Home">
            <Image
              src="/images/logo/logo-green.png"
              alt="DAM:A"
              width={120}
              height={56}
              className="h-10 w-auto lg:h-12"
              style={{ width: 'auto' }}
              priority
            />
          </Link>

          {/* Desktop Nav — centered */}
          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 lg:flex xl:gap-7" aria-label="Main navigation">
            {NAV_LINKS_PRIMARY.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap text-sm font-medium text-dama-charcoal/70 transition-colors hover:text-dama-green-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="hidden whitespace-nowrap rounded-md bg-dama-green-500 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-dama-green-600 lg:inline-flex xl:px-5"
            >
              Order Now
            </Link>

            {/* Admin link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden text-sm font-medium text-dama-green-600 transition-colors hover:text-dama-green-700 lg:inline-flex"
              >
                Admin
              </Link>
            )}

            {/* Account / Login */}
            {user ? (
              <Link
                href="/account"
                className="hidden text-sm font-medium text-dama-charcoal/70 transition-colors hover:text-dama-green-600 lg:inline-flex"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden text-sm font-medium text-dama-charcoal/70 transition-colors hover:text-dama-green-600 lg:inline-flex"
              >
                Log In
              </Link>
            )}

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-dama-sand/50"
              aria-label={`Shopping cart, ${itemCount} items`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6h12l-1.5 7.5H7.5L6 6z" />
                <path d="M6 6L5 2H2" />
                <circle cx="9" cy="18" r="1" />
                <circle cx="15" cy="18" r="1" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-dama-green-500 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-dama-sand/50 lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <div className="flex w-5 flex-col gap-[5px]">
                <span className="h-[2px] w-full bg-dama-charcoal" />
                <span className="h-[2px] w-full bg-dama-charcoal" />
                <span className="h-[2px] w-full bg-dama-charcoal" />
              </div>
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
