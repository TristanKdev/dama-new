'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Orders', href: '/admin/orders', icon: 'orders' },
  { label: 'Prep Sheet', href: '/admin/prep', icon: 'prep' },
  { label: 'Menu', href: '/admin/menu', icon: 'menu' },
  { label: 'Customers', href: '/admin/customers', icon: 'customers' },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: 'subscriptions' },
  { label: 'Delivery', href: '/admin/delivery', icon: 'delivery' },
  { label: 'Promos', href: '/admin/promos', icon: 'promos' },
  { label: 'Messages', href: '/admin/messages', icon: 'messages' },
  { label: 'Catering', href: '/admin/catering', icon: 'catering' },
  { label: 'Newsletter', href: '/admin/newsletter', icon: 'newsletter' },
  { label: 'FAQs', href: '/admin/faqs', icon: 'faqs' },
  { label: 'Labels', href: '/admin/labels', icon: 'labels' },
  { label: 'Settings', href: '/admin/settings', icon: 'settings' },
  { label: 'Audit Log', href: '/admin/audit-log', icon: 'audit' },
];

function NavIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'dashboard':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="11" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="11" width="6" height="6" rx="1" />
          <rect x="11" y="11" width="6" height="6" rx="1" />
        </svg>
      );
    case 'orders':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 1h12a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V3a2 2 0 012-2z" />
          <path d="M5 6h8M5 9h8M5 12h4" />
        </svg>
      );
    case 'menu':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="9" r="7" />
          <path d="M6 9h6M9 6v6" />
        </svg>
      );
    case 'customers':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="6" r="3" />
          <path d="M3 17c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
        </svg>
      );
    case 'subscriptions':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 9a8 8 0 0114.3-4.9" />
          <path d="M17 9a8 8 0 01-14.3 4.9" />
          <polyline points="1 4 1 9 6 9" />
          <polyline points="17 14 17 9 12 9" />
        </svg>
      );
    case 'messages':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h14a1 1 0 011 1v9a1 1 0 01-1 1H4l-3 3V4a1 1 0 011-1z" />
        </svg>
      );
    case 'faqs':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="9" r="8" />
          <path d="M6.5 6.5a2.5 2.5 0 014.4 1.6c0 1.7-2.4 2.4-2.4 2.4" />
          <circle cx="9" cy="13.5" r="0.5" fill="currentColor" />
        </svg>
      );
    case 'prep':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2h10a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
          <path d="M6 6h6M6 9h6M6 12h3" />
          <path d="M13 2v3" />
        </svg>
      );
    case 'delivery':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="10" height="9" rx="1" />
          <path d="M11 7h3l2 3v3h-5V7z" />
          <circle cx="5" cy="15" r="1.5" />
          <circle cx="14" cy="15" r="1.5" />
        </svg>
      );
    case 'promos':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 9V3a2 2 0 012-2h6l8 8-7 7-8-8z" />
          <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
        </svg>
      );
    case 'newsletter':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="16" height="12" rx="1" />
          <path d="M1 3l8 6 8-6" />
        </svg>
      );
    case 'catering':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 14h14M3 14V8a6 6 0 1112 0v6" />
          <path d="M1 14h16v1a1 1 0 01-1 1H2a1 1 0 01-1-1v-1z" />
        </svg>
      );
    case 'labels':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="14" height="5" rx="1" />
          <rect x="2" y="10" width="14" height="5" rx="1" />
          <path d="M5 5.5h8M5 12.5h8" />
        </svg>
      );
    case 'settings':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="9" r="2.5" />
          <path d="M14.7 11a1.3 1.3 0 00.3 1.4l.04.05a1.6 1.6 0 11-2.26 2.26l-.05-.04a1.3 1.3 0 00-2.2.93v.14a1.6 1.6 0 01-3.2 0v-.07a1.3 1.3 0 00-.86-1.2 1.3 1.3 0 00-1.4.3l-.05.04a1.6 1.6 0 11-2.26-2.26l.04-.05A1.3 1.3 0 002.93 11h-.14a1.6 1.6 0 010-3.2h.07a1.3 1.3 0 001.2-.86 1.3 1.3 0 00-.3-1.4l-.04-.05A1.6 1.6 0 115.98 3.23l.05.04a1.3 1.3 0 001.4.3h.07a1.3 1.3 0 00.78-1.2v-.14a1.6 1.6 0 013.2 0v.07a1.3 1.3 0 001.3 1.2 1.3 1.3 0 001.4-.3l.05-.04A1.6 1.6 0 1116.49 5.4l-.04.05a1.3 1.3 0 00-.3 1.4v.07a1.3 1.3 0 001.2.78h.14a1.6 1.6 0 010 3.2h-.07a1.3 1.3 0 00-1.2 1.3z" />
        </svg>
      );
    case 'audit':
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 1a8 8 0 110 16 8 8 0 010-16z" />
          <path d="M9 5v4l3 2" />
        </svg>
      );
    default:
      return null;
  }
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const activeItem = navItems.find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
  );

  return (
    <>
      {/* Mobile nav */}
      <div className="border-b border-dama-sand bg-white px-4 py-3 md:hidden">
        <label htmlFor="admin-nav-select" className="sr-only">Navigate admin</label>
        <div className="flex items-center gap-2">
          <span className="font-cormorant text-sm font-semibold text-dama-charcoal">Admin</span>
          <select
            id="admin-nav-select"
            value={activeItem?.href || '/admin'}
            onChange={(e) => {
              router.push(e.target.value);
            }}
            className="flex-1 rounded-md border border-dama-sand bg-white px-3 py-2 text-sm text-dama-charcoal focus:border-dama-green-400 focus:outline-none"
          >
            {navItems.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-dama-sand bg-white md:block">
        <div className="px-5 py-6">
          <h2 className="font-cormorant text-lg font-semibold text-dama-charcoal">Admin</h2>
        </div>
        <nav className="flex flex-col gap-1 px-3 pb-6">
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-dama-green-50 text-dama-green-700'
                    : 'text-dama-charcoal/70 hover:bg-dama-ivory hover:text-dama-charcoal'
                )}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
