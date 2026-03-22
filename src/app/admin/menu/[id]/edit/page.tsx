'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const CATEGORY_OPTIONS = [
  { value: 'banchan', label: 'Banchan' },
  { value: 'dosirak', label: 'Dosirak' },
  { value: 'appetizer', label: 'Appetizer' },
  { value: 'seasonal', label: 'Seasonal' },
];

const DIETARY_TAGS = ['Vegan', 'Vegetarian', 'Gluten-Friendly', 'Spicy', 'Contains Nuts', 'Dairy-Free'];

const SUBCATEGORY_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'muchim', label: 'Muchim (Seasoned)' },
  { value: 'bokkeum', label: 'Bokkeum (Stir-fried)' },
  { value: 'jorim', label: 'Jorim (Braised)' },
  { value: 'kimchi', label: 'Kimchi' },
];

interface MenuItemForm {
  name_en: string;
  name_ko: string;
  description: string;
  price: string;
  category: string;
  serving_size: string;
  dietary_tags: string[];
  ingredients: string;
  spice_level: string;
  image_url: string;
  subcategory: string;
  badges: string;
  upgrade_price: string;
  set_contents: string;
}

export default function AdminMenuEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [form, setForm] = useState<MenuItemForm>({
    name_en: '',
    name_ko: '',
    description: '',
    price: '',
    category: 'banchan',
    serving_size: '',
    dietary_tags: [],
    ingredients: '',
    spice_level: '0',
    image_url: '',
    subcategory: '',
    badges: '',
    upgrade_price: '',
    set_contents: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { createBrowserClient } = await import('@/lib/supabase');
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setForm({
          name_en: data.name_en || '',
          name_ko: data.name_ko || '',
          description: data.description || '',
          price: String(data.price || ''),
          category: data.category || 'banchan',
          serving_size: data.serving_size || '',
          dietary_tags: data.dietary_tags || [],
          ingredients: (data.ingredients || []).join(', '),
          spice_level: String(data.spice_level ?? 0),
          image_url: data.image_url || '',
          subcategory: data.subcategory || '',
          badges: (data.badges || []).join(', '),
          upgrade_price: data.upgrade_price ? String(data.upgrade_price) : '',
          set_contents: (data.set_contents || []).join(', '),
        });
      }
      setIsLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    const body: Record<string, unknown> = {
      name_en: form.name_en,
      name_ko: form.name_ko,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      serving_size: form.serving_size,
      dietary_tags: form.dietary_tags,
      ingredients: form.ingredients ? form.ingredients.split(',').map((s) => s.trim()).filter(Boolean) : [],
      spice_level: parseInt(form.spice_level, 10),
      image_url: form.image_url,
      subcategory: form.subcategory || null,
      badges: form.badges ? form.badges.split(',').map((s) => s.trim()).filter(Boolean) : null,
      upgrade_price: form.upgrade_price ? parseFloat(form.upgrade_price) : null,
      set_contents: form.set_contents ? form.set_contents.split(',').map((s) => s.trim()).filter(Boolean) : null,
    };

    const res = await fetch(`/api/admin/menu/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setMessage('Saved successfully.');
    } else {
      setMessage('Failed to save.');
    }
    setIsSaving(false);
    messageTimerRef.current = setTimeout(() => setMessage(''), 3000);
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter((t) => t !== tag)
        : [...prev.dietary_tags, tag],
    }));
  };

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/menu" className="text-sm text-dama-green-600 hover:underline">&larr; Back to Menu</Link>
      <h1 className="mt-4 font-cormorant text-2xl font-semibold text-dama-charcoal">Edit Menu Item</h1>

      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="nameEn"
            label="Name (English)"
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          />
          <Input
            id="nameKo"
            label="Name (Korean)"
            value={form.name_ko}
            onChange={(e) => setForm({ ...form, name_ko: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-dama-charcoal">Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-dama-sand bg-white px-4 py-3 text-sm text-dama-charcoal focus:border-dama-green-400 focus:outline-none focus:ring-2 focus:ring-dama-green-400/20"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            id="price"
            label="Price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Select
            id="category"
            label="Category"
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            id="servingSize"
            label="Serving Size"
            value={form.serving_size}
            onChange={(e) => setForm({ ...form, serving_size: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="spiceLevel"
            label="Spice Level"
            options={[
              { value: '0', label: 'None' },
              { value: '1', label: 'Mild' },
              { value: '2', label: 'Medium' },
              { value: '3', label: 'Hot' },
            ]}
            value={form.spice_level}
            onChange={(e) => setForm({ ...form, spice_level: e.target.value })}
          />
        </div>

        <Input
          id="ingredients"
          label="Ingredients (comma-separated)"
          value={form.ingredients}
          onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
        />

        {/* Category-specific fields */}
        {form.category === 'banchan' && (
          <Select
            id="subcategory"
            label="Subcategory"
            options={SUBCATEGORY_OPTIONS}
            value={form.subcategory}
            onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
          />
        )}

        {form.category === 'dosirak' && (
          <div className="space-y-4 rounded-md border border-dama-sand/50 bg-dama-ivory/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-dama-charcoal/60">Dosirak Set Fields</p>
            <Input
              id="setContents"
              label="Set Contents (comma-separated)"
              placeholder="e.g. 3 Banchan, Japchae, Steamed Rice"
              value={form.set_contents}
              onChange={(e) => setForm({ ...form, set_contents: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="badges"
                label="Badges (comma-separated)"
                placeholder="e.g. Most Popular, Best Value"
                value={form.badges}
                onChange={(e) => setForm({ ...form, badges: e.target.value })}
              />
              <Input
                id="upgradePrice"
                label="Upgrade Price ($)"
                type="number"
                step="0.01"
                placeholder="e.g. 4"
                value={form.upgrade_price}
                onChange={(e) => setForm({ ...form, upgrade_price: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Dietary Tags */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-dama-charcoal">Dietary Tags</p>
          <div className="flex flex-wrap gap-2">
            {DIETARY_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.dietary_tags.includes(tag)
                    ? 'bg-dama-green-500 text-white'
                    : 'bg-dama-ivory text-dama-charcoal/60 hover:bg-dama-sand'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          {message && (
            <p className={`text-sm ${message.includes('Failed') ? 'text-dama-error' : 'text-dama-green-700'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
