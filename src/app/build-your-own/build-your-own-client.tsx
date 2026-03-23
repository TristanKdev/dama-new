'use client';

import { useState } from 'react';
import { DosirakBoxBuilder } from '@/components/tray/DosirakBoxBuilder';
import { TrayBuilder } from '@/components/tray/TrayBuilder';
import type { MenuItem } from '@/types/menu';

type BuildMode = 'dosirak' | 'tray';

export default function BuildYourOwnClient({ menuItems }: { menuItems: MenuItem[] }) {
  const [mode, setMode] = useState<BuildMode>('dosirak');

  const banchanItems = menuItems.filter(i => i.category === 'banchan' && i.available && !i.soldOut);
  const mainItems = menuItems.filter(i => i.category === 'main' && i.available && !i.soldOut);

  return (
    <div className="bg-dama-cream">
      {/* Hero */}
      <div className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Build Your Own</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            Custom Dosirak Box
          </h1>
          <p className="mt-4 text-base text-dama-charcoal/70">
            Fill each compartment with your favorites — protein, rice, and banchan sides, just the way you like.
          </p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mb-8 flex justify-center gap-3">
          <button
            onClick={() => setMode('dosirak')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              mode === 'dosirak'
                ? 'bg-dama-green-500 text-white shadow-md'
                : 'bg-white text-dama-charcoal/60 hover:bg-dama-green-50'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="16" height="16" rx="2" />
              <path d="M1 7h16M7 1v16M12 7v10" />
            </svg>
            Dosirak Box
          </button>
          <button
            onClick={() => setMode('tray')}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              mode === 'tray'
                ? 'bg-dama-green-500 text-white shadow-md'
                : 'bg-white text-dama-charcoal/60 hover:bg-dama-green-50'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="16" height="16" rx="2" />
              <path d="M1 5h16M1 9h16M1 13h16M5 1v16M9 1v16M13 1v16" />
            </svg>
            Banchan Tray (4 / 8 / 12)
          </button>
        </div>
      </div>

      {/* Builder */}
      <div className="mx-auto max-w-5xl px-4 pb-16 md:px-6 md:pb-24">
        {mode === 'dosirak' ? (
          <DosirakBoxBuilder banchanItems={banchanItems} mainItems={mainItems} />
        ) : (
          <TrayBuilder menuItems={banchanItems} />
        )}
      </div>
    </div>
  );
}
