'use client';

import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = useCallback((id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className={cn('divide-y divide-dama-sand', className)}>
      {items.map((item) => (
        <div key={item.id} className="py-0">
          <button
            type="button"
            onClick={() => toggle(item.id)}
            className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-dama-green-600"
            aria-expanded={openId === item.id}
            aria-controls={`accordion-content-${item.id}`}
          >
            <span className="pr-4 text-base font-medium text-dama-charcoal">
              {item.title}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={cn(
                'shrink-0 transition-transform duration-300',
                openId === item.id && 'rotate-180'
              )}
              aria-hidden="true"
            >
              <path d="M5 8l5 5 5-5" />
            </svg>
          </button>
          <div
            id={`accordion-content-${item.id}`}
            role="region"
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{
              gridTemplateRows: openId === item.id ? '1fr' : '0fr',
            }}
          >
            <div className="overflow-hidden">
              <p className="pb-5 text-sm leading-relaxed text-dama-charcoal/70">
                {item.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
