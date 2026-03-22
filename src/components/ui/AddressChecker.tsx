'use client';

import { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { cn } from '@/lib/utils';
import type { AddressCheckResult } from '@/types/address';

interface AddressCheckerProps {
  className?: string;
  compact?: boolean;
  onConfirm?: (address: string, buildingName?: string) => void;
}

export function AddressChecker({ className, compact, onConfirm }: AddressCheckerProps) {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<AddressCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/check-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = await res.json();
      setResult(data);
      if (data.eligible && onConfirm) {
        onConfirm(address.trim(), data.buildingName);
      }
    } catch {
      setResult({
        eligible: false,
        method: null,
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex gap-3', compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row')}>
        <div className="flex-1">
          <Input
            placeholder="Enter your building address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            aria-label="Building address"
          />
        </div>
        <Button
          onClick={handleCheck}
          disabled={loading || !address.trim()}
          size={compact ? 'md' : 'md'}
          className="shrink-0"
        >
          {loading ? 'Checking...' : 'Check Address'}
        </Button>
      </div>

      {result && (
        <div
          className={cn(
            'mt-3 rounded-md px-4 py-3 text-sm',
            result.eligible
              ? 'bg-dama-green-50 text-dama-green-700'
              : 'bg-amber-50 text-amber-700'
          )}
          role="status"
        >
          <p className="font-medium">
            {result.eligible ? '✓ ' : ''}{result.message}
          </p>
          {result.eligible && result.buildingName && (
            <p className="mt-1 text-xs opacity-80">
              Building: {result.buildingName} — {result.method === 'building-delivery' ? 'Direct building delivery available' : 'Pickup available'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
