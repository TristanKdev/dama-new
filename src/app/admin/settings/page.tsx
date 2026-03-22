'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const SETTING_GROUPS = [
  {
    title: 'Announcement Banner',
    description: 'Show a message across the top of the site (closings, specials, promotions).',
    fields: [
      { key: 'announcement_text', label: 'Banner Message', placeholder: 'We are closed for the holiday — orders resume Tuesday!' },
      { key: 'announcement_color', label: 'Color', placeholder: 'green', type: 'select', options: ['green', 'amber', 'red', 'blue', 'charcoal'] },
    ],
    toggleKey: 'announcement_active',
    toggleLabel: 'Show Banner',
  },
  {
    title: 'Business Info',
    fields: [
      { key: 'business_name', label: 'Business Name', placeholder: 'DAM:A' },
      { key: 'business_email', label: 'Contact Email', placeholder: 'hello@damajc.com' },
      { key: 'business_phone', label: 'Phone', placeholder: '(201) 555-0100' },
      { key: 'business_address', label: 'Address', placeholder: '123 Main St, Jersey City, NJ' },
    ],
  },
  {
    title: 'Social Media',
    description: 'Update your social media profile links (shown in the footer).',
    fields: [
      { key: 'social_instagram', label: 'Instagram URL', placeholder: 'https://www.instagram.com/dama.jc' },
      { key: 'social_facebook', label: 'Facebook URL', placeholder: 'https://www.facebook.com/dama.jc' },
      { key: 'social_tiktok', label: 'TikTok URL', placeholder: 'https://www.tiktok.com/@dama.jc' },
    ],
  },
  {
    title: 'Delivery Settings',
    description: 'Note: Delivery fee, free delivery minimum, and order minimum are set in code (src/lib/constants.ts) and require a redeploy to take effect. Values here are saved for reference only.',
    fields: [
      { key: 'delivery_fee', label: 'Delivery Fee ($)', placeholder: '5.00' },
      { key: 'free_delivery_minimum', label: 'Free Delivery Minimum ($)', placeholder: '50.00' },
      { key: 'delivery_window', label: 'Delivery Window', placeholder: 'By 12:00 PM' },
      { key: 'pickup_window', label: 'Pickup Window', placeholder: '11:00 AM – 6:00 PM' },
    ],
  },
  {
    title: 'Order Settings',
    description: 'Note: Minimum order amount is set in code (src/lib/constants.ts) and requires a redeploy to take effect.',
    fields: [
      { key: 'min_order_amount', label: 'Minimum Order ($)', placeholder: '15.00' },
      { key: 'order_cutoff_hours', label: 'Order Cutoff (hours before)', placeholder: '24' },
      { key: 'max_orders_per_day', label: 'Max Orders Per Day', placeholder: '50' },
    ],
  },
  {
    title: 'Notifications',
    fields: [
      { key: 'admin_notification_email', label: 'Admin Alert Email', placeholder: 'admin@damajc.com' },
      { key: 'order_confirmation_bcc', label: 'Order Confirmation BCC', placeholder: 'orders@damajc.com' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings ?? {});
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        setSaved(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || 'Failed to save settings');
      }
    } catch {
      setSaveError('Network error — please try again');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading settings...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">Settings</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-dama-green-600">Saved!</span>}
          {saveError && <span className="text-sm text-red-600">{saveError}</span>}
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {SETTING_GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-semibold text-dama-charcoal">{group.title}</h2>
            {group.description && (
              <p className="mt-1 text-sm text-dama-charcoal/50">{group.description}</p>
            )}
            <div className="mt-4 rounded-lg border border-dama-sand bg-white p-5">
              {/* Toggle switch for groups that have one */}
              {group.toggleKey && (
                <div className="mb-4 flex items-center gap-3 border-b border-dama-sand pb-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings[group.toggleKey] === 'true'}
                    onClick={() => handleChange(group.toggleKey!, settings[group.toggleKey] === 'true' ? 'false' : 'true')}
                    className={`relative h-6 w-11 rounded-full transition-colors ${settings[group.toggleKey] === 'true' ? 'bg-dama-green-500' : 'bg-dama-sand'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${settings[group.toggleKey] === 'true' ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm font-medium text-dama-charcoal">{group.toggleLabel}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {group.fields.map((field) => {
                  if ((field as { type?: string }).type === 'select') {
                    return (
                      <div key={field.key}>
                        <label htmlFor={field.key} className="mb-1 block text-xs font-medium text-dama-charcoal/60">{field.label}</label>
                        <select
                          id={field.key}
                          value={settings[field.key] ?? ''}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="w-full rounded-md border border-dama-sand bg-white px-3 py-2 text-sm text-dama-charcoal focus:border-dama-green-400 focus:outline-none"
                        >
                          <option value="">Default</option>
                          {((field as { options?: string[] }).options ?? []).map((opt) => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <Input
                      key={field.key}
                      id={field.key}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={settings[field.key] ?? ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
