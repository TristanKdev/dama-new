'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    expires_at: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPromos = async () => {
    try {
      const res = await fetch('/api/admin/promos');
      const data = await res.json();
      setPromos(data.promos || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const openCreate = () => {
    setEditingPromo(null);
    setFormData({ code: '', discount_type: 'percent', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '' });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      min_order_amount: promo.min_order_amount ? String(promo.min_order_amount) : '',
      max_uses: promo.max_uses ? String(promo.max_uses) : '',
      expires_at: promo.expires_at ? promo.expires_at.split('T')[0] : '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discount_value) {
      setErrorMsg('Code and discount value are required.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        code: formData.code,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_order_amount: formData.min_order_amount ? Number(formData.min_order_amount) : 0,
        max_uses: formData.max_uses ? Number(formData.max_uses) : null,
        expires_at: formData.expires_at || null,
      };

      let res: Response;
      if (editingPromo) {
        res = await fetch(`/api/admin/promos/${editingPromo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/promos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to save.');
        return;
      }

      setModalOpen(false);
      fetchPromos();
    } catch {
      setErrorMsg('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promo: PromoCode) => {
    await fetch(`/api/admin/promos/${promo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !promo.active }),
    });
    setPromos((prev) => prev.map((p) => (p.id === promo.id ? { ...p, active: !p.active } : p)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
    setPromos((prev) => prev.filter((p) => p.id !== id));
  };

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading promo codes...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Promo Codes</h1>
        <Button size="sm" onClick={openCreate}>Add Promo Code</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-dama-sand bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dama-sand">
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Code</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Discount</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Min Order</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Uses</th>
              <th className="px-4 py-3 text-left font-medium text-dama-charcoal/60">Expires</th>
              <th className="px-4 py-3 text-center font-medium text-dama-charcoal/60">Active</th>
              <th className="px-4 py-3 text-right font-medium text-dama-charcoal/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dama-sand/50">
            {promos.map((promo) => (
              <tr key={promo.id} className="hover:bg-dama-ivory/50">
                <td className="px-4 py-3 font-mono font-semibold text-dama-charcoal">{promo.code}</td>
                <td className="px-4 py-3 text-dama-charcoal">
                  {promo.discount_type === 'percent' ? `${promo.discount_value}%` : formatPrice(promo.discount_value)}
                </td>
                <td className="px-4 py-3 text-dama-charcoal/70">
                  {promo.min_order_amount > 0 ? formatPrice(promo.min_order_amount) : '—'}
                </td>
                <td className="px-4 py-3 text-dama-charcoal/70">
                  {promo.current_uses}{promo.max_uses ? ` / ${promo.max_uses}` : ''}
                </td>
                <td className="px-4 py-3 text-dama-charcoal/70">
                  {promo.expires_at
                    ? new Date(promo.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Never'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={promo.active}
                    onClick={() => toggleActive(promo)}
                    className={`relative mx-auto h-5 w-9 rounded-full transition-colors ${promo.active ? 'bg-dama-green-500' : 'bg-dama-sand'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${promo.active ? 'translate-x-4' : ''}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(promo)} className="text-xs font-medium text-dama-green-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(promo.id)} className="ml-3 text-xs font-medium text-dama-error hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-dama-charcoal/50">
                  No promo codes yet. Click &quot;Add Promo Code&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-lg">
        <h2 className="mb-4 text-lg font-semibold text-dama-charcoal">
          {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
        </h2>
        <div className="space-y-4">
          <Input
            id="promo-code"
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            disabled={!!editingPromo}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="promo-type"
              label="Discount Type"
              options={[
                { value: 'percent', label: 'Percentage (%)' },
                { value: 'fixed', label: 'Fixed Amount ($)' },
              ]}
              value={formData.discount_type}
              onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
            />
            <Input
              id="promo-value"
              label={formData.discount_type === 'percent' ? 'Percentage' : 'Amount ($)'}
              type="number"
              step={formData.discount_type === 'percent' ? '1' : '0.01'}
              value={formData.discount_value}
              onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="promo-min"
              label="Min Order Amount ($)"
              type="number"
              step="0.01"
              value={formData.min_order_amount}
              onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
            />
            <Input
              id="promo-max-uses"
              label="Max Uses (blank = unlimited)"
              type="number"
              value={formData.max_uses}
              onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
            />
          </div>
          <Input
            id="promo-expires"
            label="Expiration Date (optional)"
            type="date"
            value={formData.expires_at}
            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
          />
          {errorMsg && <p className="text-sm text-dama-error">{errorMsg}</p>}
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingPromo ? 'Update' : 'Create'}
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
