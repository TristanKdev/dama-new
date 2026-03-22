import type { Metadata } from 'next';
import { Accordion } from '@/components/ui/Accordion';
import { faqItems as staticFaqItems, faqCategories as staticFaqCategories } from '@/data/faq-items';
import type { FAQRow } from '@/types/database';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about DAM:A — ordering, delivery, subscriptions, food quality, and more.',
};

export const revalidate = 3600; // Revalidate FAQ every hour

async function getFaqs() {
  try {
    const { createServiceRoleClient } = await import('@/lib/supabase');
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) return null;
    return data as FAQRow[];
  } catch {
    return null;
  }
}

// Generates safe JSON-LD script content from structured FAQ data (not user-generated HTML)
function generateJsonLd(items: { question: string; answer: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  });
}

export default async function FAQPage() {
  const dbFaqs = await getFaqs();

  // Use DB data if available, otherwise fall back to static data
  const faqData = dbFaqs
    ? dbFaqs.map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        category: row.category,
      }))
    : staticFaqItems;

  const categories = dbFaqs
    ? [...new Set(dbFaqs.map((f) => f.category))]
    : (staticFaqCategories as unknown as string[]);

  // JSON-LD structured data - content is from our DB/static data (admin-controlled), safe to inline
  const jsonLdScript = generateJsonLd(faqData);

  return (
    <div className="bg-dama-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript }}
      />
      <div className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">Help Center</p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base text-dama-charcoal/70">
            Everything you need to know about ordering, delivery, and subscriptions.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-16 md:px-6 md:pb-24">
        {categories.map((category) => {
          const categoryItems = faqData
            .filter((item) => item.category === category)
            .map((item) => ({ id: item.id, title: item.question, content: item.answer }));

          return (
            <div key={category} className="mb-10">
              <h2 className="mb-4 text-lg font-semibold text-dama-charcoal">{category}</h2>
              <Accordion items={categoryItems} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
