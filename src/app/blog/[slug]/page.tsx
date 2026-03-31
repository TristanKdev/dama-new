import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllSlugs, blogPosts } from '@/data/blog-posts';

const categoryColors: Record<string, string> = {
  'Korean Food 101': 'bg-dama-green-100 text-dama-green-700',
  'Korean Food': 'bg-dama-green-100 text-dama-green-700',
  'Health & Wellness': 'bg-blue-100 text-blue-700',
  'Wellness': 'bg-blue-100 text-blue-700',
  'Tips & Recipes': 'bg-orange-100 text-orange-700',
  'Cooking Tips': 'bg-orange-100 text-orange-700',
  'Community': 'bg-purple-100 text-purple-700',
  'Jersey City': 'bg-purple-100 text-purple-700',
  'Sustainability': 'bg-emerald-100 text-emerald-700',
  'Behind the Scenes': 'bg-amber-100 text-amber-700',
  'Culture': 'bg-rose-100 text-rose-700',
  'Meal Prep': 'bg-teal-100 text-teal-700',
  'Seasonal': 'bg-yellow-100 text-yellow-700',
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} — DAM:A Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Find related posts (same category, excluding current)
  const related = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  return (
    <div className="bg-dama-cream">
      {/* Header */}
      <div className="bg-dama-green-50 py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-dama-green-600 transition-colors hover:text-dama-green-700"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Back to Blog
          </Link>
          <div className="mt-6">
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
              {post.category}
            </span>
          </div>
          <h1 className="mt-3 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-dama-charcoal/50">
            <time dateTime={post.date}>
              {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <span>&middot;</span>
            <span>{post.readTime}</span>
            {post.author && (
              <>
                <span>&middot;</span>
                <a href="https://onyxxmediagroup.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-dama-green-600">
                  {post.author}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero image */}
      {post.image && (
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <article className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((block, i) => {
            if (block.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="mb-4 mt-10 font-cormorant text-2xl font-semibold text-dama-charcoal md:text-3xl"
                >
                  {block.replace('## ', '')}
                </h2>
              );
            }

            if (block.startsWith('**') && block.includes('** — ')) {
              const match = block.match(/^\*\*(.+?)\*\* — (.+)$/);
              if (match) {
                return (
                  <p key={i} className="mb-3 text-base leading-relaxed text-dama-charcoal/80">
                    <strong className="font-semibold text-dama-charcoal">{match[1]}</strong>
                    {' — '}
                    {match[2]}
                  </p>
                );
              }
            }

            if (/^\d+\. \*\*/.test(block)) {
              const items = block.split('\n').filter(Boolean);
              return (
                <ol key={i} className="mb-6 list-decimal space-y-2 pl-6">
                  {items.map((item, j) => {
                    const cleaned = item.replace(/^\d+\.\s*/, '');
                    const boldMatch = cleaned.match(/^\*\*(.+?)\*\*\s*[-—]\s*(.+)$/);
                    if (boldMatch) {
                      return (
                        <li key={j} className="text-base leading-relaxed text-dama-charcoal/80">
                          <strong className="font-semibold text-dama-charcoal">{boldMatch[1]}</strong>
                          {' — '}
                          {boldMatch[2]}
                        </li>
                      );
                    }
                    return (
                      <li key={j} className="text-base leading-relaxed text-dama-charcoal/80">
                        {cleaned}
                      </li>
                    );
                  })}
                </ol>
              );
            }

            return (
              <p key={i} className="mb-4 text-base leading-relaxed text-dama-charcoal/80">
                {block}
              </p>
            );
          })}
        </article>

        {/* CTA */}
        <div className="mt-16 rounded-lg bg-dama-green-50 p-8 text-center">
          <h2 className="font-cormorant text-2xl font-semibold text-dama-charcoal">
            Choose. Contain. Enjoy.
          </h2>
          <p className="mt-2 text-sm text-dama-charcoal/60">
            Thoughtfully prepared Korean meals delivered to your building in Jersey City.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-md bg-dama-green-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dama-green-600"
            >
              View Menu
            </Link>
            <Link
              href="/subscribe"
              className="rounded-md border border-dama-green-500 px-6 py-2.5 text-sm font-medium text-dama-green-600 transition-colors hover:bg-dama-green-50"
            >
              Subscribe & Save
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-cormorant text-2xl font-semibold text-dama-charcoal">
              More in {post.category}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {related.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group rounded-lg border border-dama-sand/50 bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[relatedPost.category] || 'bg-gray-100 text-gray-700'}`}>
                    {relatedPost.category}
                  </span>
                  <h3 className="mt-2 font-cormorant text-lg font-semibold text-dama-charcoal group-hover:text-dama-green-600">
                    {relatedPost.title}
                  </h3>
                  <p className="mt-1 text-sm text-dama-charcoal/60 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
