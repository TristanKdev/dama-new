'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
}

const FAQ_CATEGORIES = [
  { value: 'Ordering', label: 'Ordering' },
  { value: 'Delivery', label: 'Delivery' },
  { value: 'Subscriptions', label: 'Subscriptions' },
  { value: 'Food & Quality', label: 'Food & Quality' },
  { value: 'Other', label: 'Other' },
];

export default function AdminFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Ordering',
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      setFaqs(data.faqs || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreate = () => {
    setEditingFaq(null);
    setFormData({ question: '', answer: '', category: 'Ordering', sort_order: 0 });
    setModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      sort_order: faq.sort_order,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingFaq) {
        await fetch(`/api/admin/faqs/${editingFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/admin/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setModalOpen(false);
      fetchFaqs();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE' });
    fetchFaqs();
  };

  if (isLoading) {
    return <div className="text-sm text-dama-charcoal/60">Loading FAQs...</div>;
  }

  // Group by category
  const grouped = FAQ_CATEGORIES.map((cat) => ({
    category: cat.value,
    items: faqs.filter((f) => f.category === cat.value),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-semibold text-dama-charcoal">FAQs</h1>
        <Button size="sm" onClick={openCreate}>
          Add FAQ
        </Button>
      </div>

      <div className="mt-6 space-y-8">
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-dama-charcoal/50">
              {category}
            </h2>
            <div className="divide-y divide-dama-sand rounded-lg border border-dama-sand bg-white">
              {items.map((faq) => (
                <div key={faq.id} className="flex items-start justify-between gap-4 p-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dama-charcoal">{faq.question}</p>
                    <p className="mt-1 text-xs text-dama-charcoal/50 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => openEdit(faq)}
                      className="text-xs font-medium text-dama-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-xs font-medium text-dama-error hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <p className="text-sm text-dama-charcoal/50">No FAQs yet. Click &quot;Add FAQ&quot; to create one.</p>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-lg">
        <h2 className="mb-4 text-lg font-semibold text-dama-charcoal">
          {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
        </h2>
        <div className="space-y-4">
          <Input
            id="faq-question"
            label="Question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          />
          <div>
            <label htmlFor="faq-answer" className="mb-1.5 block text-sm font-medium text-dama-charcoal">
              Answer
            </label>
            <textarea
              id="faq-answer"
              rows={4}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full rounded-md border border-dama-sand bg-white px-4 py-3 text-dama-charcoal transition-colors focus:border-dama-green-400 focus:outline-none focus:ring-2 focus:ring-dama-green-400/20"
            />
          </div>
          <Select
            id="faq-category"
            label="Category"
            options={FAQ_CATEGORIES}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <Input
            id="faq-sort"
            label="Sort Order"
            type="number"
            value={String(formData.sort_order)}
            onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
          />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingFaq ? 'Update' : 'Create'}
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
