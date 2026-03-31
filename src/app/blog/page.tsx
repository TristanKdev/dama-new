import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/data/blog-posts';

export const metadata: Metadata = {
  title: 'Blog — Korean Food, Culture & Recipes',
  description: 'Explore the world of Korean banchan, home cooking traditions, and how DAM:A brings authentic flavors to Jersey City.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'The DAM:A Blog — Korean Food, Culture & Recipes',
    description: 'Stories about Korean food, banchan culture, and the flavors that bring us together.',
    images: [{ url: '/images/logo/logo-green.png', width: 1200, height: 560, alt: 'DAM:A — Simply Wholesome Korean Meals' }],
  },
};

export const revalidate = 3600; // Revalidate blog every hour

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

export default function BlogPage() {
  return (
    <div className="bg-dama-cream">
      {/* Hero */}
      <div className="bg-dama-green-50 py-12 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <p className="text-sm font-medium uppercase tracking-wider text-dama-green-600">
            From Our Kitchen
          </p>
          <h1 className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-5xl">
            The DAM:A Blog
          </h1>
          <p className="mt-4 text-base text-dama-charcoal/70">
            Stories about Korean food, banchan culture, and the flavors that bring us together.
          </p>
        </div>
      </div>

      {/* Featured Post */}
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        {blogPosts.length > 0 && (
          <Link href={`/blog/${blogPosts[0].slug}`} className="group block">
            <article className="overflow-hidden rounded-lg border border-dama-sand bg-white transition-shadow group-hover:shadow-md">
              {blogPosts[0].image && (
                <div className="relative aspect-[21/9] w-full">
                  <Image
                    src={blogPosts[0].image}
                    alt={blogPosts[0].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 896px"
                  />
                </div>
              )}
              <div className="p-6 md:p-10">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[blogPosts[0].category] || 'bg-gray-100 text-gray-700'}`}>
                  {blogPosts[0].category}
                </span>
                <h2 className="mt-3 font-cormorant text-2xl font-semibold text-dama-charcoal group-hover:text-dama-green-600 md:text-3xl">
                  {blogPosts[0].title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-dama-charcoal/70">
                  {blogPosts[0].excerpt}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-dama-charcoal/50">
                  <time dateTime={blogPosts[0].date}>
                    {new Date(blogPosts[0].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </time>
                  <span>&middot;</span>
                  <span>{blogPosts[0].readTime}</span>
                </div>
              </div>
            </article>
          </Link>
        )}

        {/* Post Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {blogPosts.slice(1).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-dama-sand/50 bg-white transition-shadow group-hover:shadow-md">
                {post.image && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 448px"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'}`}>
                      {post.category}
                    </span>
                    <time dateTime={post.date} className="text-xs text-dama-charcoal/60">
                      {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </time>
                  </div>
                  <h3 className="font-cormorant text-xl font-semibold text-dama-charcoal group-hover:text-dama-green-600">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-dama-charcoal/60 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-dama-charcoal/60">{post.readTime}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-lg bg-dama-green-50 p-8 text-center md:p-12">
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
      </div>
    </div>
  );
}
