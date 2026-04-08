'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/* ────────────────────────────────────────────
   SURA by DAM:A — Korean Royal Catering
   Dark navy / gold luxury theme, self-contained
   ──────────────────────────────────────────── */

const EXPERIENCE_CHAPTERS = [
  {
    roman: 'I',
    title: 'The Arrival',
    desc: 'A curated reception course — the first gesture of the royal welcome. Passed bites that open the palate and open the conversation.',
  },
  {
    roman: 'II',
    title: 'The Table',
    desc: 'Full multi-course Korean dining. Artisan box presentation in the five-color philosophy — visually arresting before a single bite is taken.',
  },
  {
    roman: 'III',
    title: 'The Story Card',
    desc: 'At every seat: a printed narrative. The history and intention behind each dish. A conversation piece that transforms dinner into cultural memory.',
  },
  {
    roman: 'IV',
    title: 'The Ceremony',
    desc: 'Traditional Korean confections and seasonal sweets close the experience. Not an afterthought — a final chapter with intention.',
  },
  {
    roman: 'V',
    title: 'The Curation',
    desc: 'Every SURA event is art-directed. Color palettes. Textures. Seasonal themes. The table becomes a designed object — not just a meal.',
  },
  {
    roman: 'VI',
    title: 'The Departure',
    desc: 'A small gift for every guest. A cultural keepsake. The experience continues beyond the table — because hospitality does not end at the door.',
  },
];

const TIERS = [
  {
    badge: 'Reception',
    name: 'SURA Reception',
    ko: '\uC218\uB77C \uB9AC\uC149\uC158',
    items: [
      'Curated passed bites',
      'Korean-style reception station',
      'Dessert array',
      'Brand story display',
    ],
    forText: 'Cocktail receptions \u00B7 Art openings \u00B7 Venue previews',
    featured: false,
  },
  {
    badge: 'Signature',
    name: 'SURA Signature',
    ko: '\uC218\uB77C \uC2DC\uADF8\uB2C8\uCC98',
    items: [
      'Full multi-course curated menu',
      'Artisan box presentation',
      'Dessert & sweets included',
      'Story card at every seat',
      'Dietary accommodation',
    ],
    forText: 'Corporate galas \u00B7 VIP dinners \u00B7 Cultural receptions',
    featured: true,
  },
  {
    badge: 'Grand',
    name: 'SURA Grand',
    ko: '\uC218\uB77C \uADF8\uB79C\uB4DC',
    items: [
      'All of Signature',
      'Ceremonial plated service',
      'Advance tasting session',
      'Cultural collateral package',
      'Dedicated event liaison',
    ],
    forText: 'Weddings \u00B7 Milestone galas \u00B7 Seated celebrations',
    featured: false,
  },
];

const STATS = [
  {
    num: '$4,250+',
    label:
      'Added margin per Grand-tier event (50 guests). Zero kitchen overhead on your end.',
  },
  {
    num: '0',
    label:
      'Competing royal Korean catering brands in the NYC\u2013NJ metro. The first venue owns the category.',
  },
  {
    num: '30\u201340%',
    label:
      'Standard venue markup. You price to your clients. We produce and deliver everything.',
  },
  {
    num: '45 min',
    label:
      'Complimentary tasting session. No commitment. The fastest way to see if SURA fits your calendar.',
  },
];

const MODELS = [
  {
    label: 'Model A',
    text: 'Wholesale Supply',
    desc: ' \u2014 SURA invoices the venue at supply price. You mark up 30\u201340% and bill your client. You control the pricing and client relationship. Most popular with new partners.',
  },
  {
    label: 'Model B',
    text: 'Revenue Share',
    desc: ' \u2014 SURA invoices the client directly and pays the venue 15\u201320% of total. Zero billing involvement required from your team. Ideal for pilot events.',
  },
];

export default function SuraPage() {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Add dark-theme class to html so the site header/banner adapt
  useEffect(() => {
    document.documentElement.classList.add('sura-page');
    return () => document.documentElement.classList.remove('sura-page');
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('sura-visible');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  let refIdx = 0;
  const reveal = (delay?: number, extra?: string) => {
    const i = refIdx++;
    return {
      ref: (el: HTMLDivElement | null) => {
        revealRefs.current[i] = el;
      },
      className: `sura-reveal${delay ? ` sura-delay-${delay}` : ''}${extra ? ` ${extra}` : ''}`,
    };
  };

  return (
    <div className="sura-theme">
      <style>{suraStyles}</style>

      {/* ── HERO ── */}
      <section className="sura-hero">
        <div className="sura-hero-left">
          <div className="sura-hero-eyebrow">
            {'수라'} &nbsp;&middot;&nbsp; Royal Korean Catering
          </div>
          <h1 className="sura-hero-title">
            SURA<span className="sura-dot">.</span>
          </h1>
          <div className="sura-hero-title-ko">{'수라'}</div>
          <p className="sura-hero-desc">
            Once prepared for a king.
            <br />
            Now set before someone just as precious.
          </p>
          <div className="sura-hero-actions">
            <a href="#sura-experience" className="sura-btn-primary">
              Explore the Experience
            </a>
            <a href="#sura-venue" className="sura-btn-ghost">
              Venue Partners
            </a>
          </div>
        </div>
        <div className="sura-hero-right">
          <Image
            src="/images/photo/dosirak-closeup-warm.jpg"
            alt="SURA Korean royal catering — artisan dosirak presentation"
            fill
            className="sura-hero-img"
            sizes="50vw"
            priority
          />
          <div className="sura-hero-img-overlay" />
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="sura-story" id="sura-story">
        <div className="sura-container">
          <div className="sura-story-grid">
            <div {...reveal()}>
              <span className="sura-story-number">{'수'}</span>
              <div className="sura-sec-label">
                The Origin<span className="sura-rule" />
              </div>
              <h2 className="sura-story-h3">
                A meal fit for a king took
                <br />
                <em>one hundred hands.</em>
              </h2>
              <div className="sura-gold-divider" />
              <p className="sura-story-body">
                In the Joseon Dynasty, preparing the King&apos;s meal — called{' '}
                <em>{'수라'} (Sura)</em> — was not a kitchen task. It was a
                state act. One hundred hands prepared it. Twelve hours of
                intention preceded it. The finest ingredients from every province
                of Korea arrived daily at the palace gate.
              </p>
              <p className="sura-story-body">
                Nothing was arbitrary. Five flavors. Five colors. Five elements.
                The meal expressed the harmony of the universe — on a single
                table, for a single moment.
              </p>
            </div>
            <div {...reveal(2)}>
              <div className="sura-sec-label">
                The Philosophy<span className="sura-rule" />
              </div>
              <h2 className="sura-story-h3">
                A tradition <em>encoded</em>
                <br />
                in every dish.
              </h2>
              <div className="sura-gold-divider" />
              <p className="sura-story-body">
                Korean royal cuisine is the most rigorously designed food culture
                in the world. The Joseon court employed dedicated culinary
                scholars whose sole purpose was to refine, document, and protect
                the tradition across five hundred years of continuous rule.
              </p>
              <blockquote className="sura-pull">
                &ldquo;Each dish carried meaning. Lotus root symbolized
                integrity. Abalone — longevity. The arrangement of color on the
                table was itself a prayer.&rdquo;
              </blockquote>
              <div className="sura-story-card">
                <div className="sura-story-card-ko">
                  {'왕에게 올리던 한 끼,'}
                  <br />
                  {'이제 가장 귀한 사람에게.'}
                </div>
                <div className="sura-story-card-en">
                  Once prepared for a king.
                  <br />
                  Now set before someone just as precious.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE ── */}
      <section className="sura-experience" id="sura-experience">
        <div className="sura-container">
          <div {...reveal(undefined, 'sura-exp-intro')}>
            <div className="sura-sec-label sura-sec-label-center">
              The Experience
            </div>
            <h2 className="sura-sec-h2">
              Six chapters of
              <br />
              <em>the royal table</em>
            </h2>
            <p className="sura-exp-body">
              Every SURA event is a complete narrative — curated from the first
              course to the final ceremony.
            </p>
          </div>
          <div className="sura-exp-grid">
            {EXPERIENCE_CHAPTERS.map((ch, i) => (
              <div
                key={ch.roman}
                {...reveal(Math.min(i, 5))}
              >
                <div className="sura-exp-card">
                  <span className="sura-exp-roman">{ch.roman}</span>
                  <div className="sura-exp-title">{ch.title}</div>
                  <p className="sura-exp-desc">{ch.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Promise strip */}
          <div {...reveal(undefined, 'sura-promise')}>
            <div className="sura-sec-label">
              The Promise<span className="sura-rule" />
            </div>
            <div className="sura-promise-grid">
              {[
                ['100%', 'prepared in our dedicated kitchen — never outsourced, never frozen.'],
                ['Custom', 'menus for every event. No fixed packages. Your guests. Your table.'],
                ['Allergy-safe', 'accommodations built in. Every dietary need addressed in advance.'],
              ].map(([bold, text]) => (
                <div className="sura-promise-item" key={bold}>
                  <span className="sura-promise-bold">{bold}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO FEATURE ── */}
      <div className="sura-photo-feature">
        <div className="sura-photo-feature-inner">
          <div className="sura-photo-feature-img">
            <Image
              src="/images/photo/dosirak-angled-dark.jpg"
              alt="SURA Korean royal dosirak — multi-course box presentation"
              fill
              className="object-cover object-center"
              sizes="50vw"
            />
          </div>
          <div {...reveal(undefined, 'sura-photo-feature-content')}>
            <div className="sura-feature-quote">
              &ldquo;Korean cuisine was never meant to be consumed — it was
              meant to be received. SURA restores that intention.&rdquo;
            </div>
            <p className="sura-feature-sub">
              SURA partners exclusively with hotels and venues who share our
              conviction that extraordinary hospitality is a form of art. We
              supply. You present. Your clients remember.
            </p>
            <div className="sura-feature-attr">
              SURA by DAM:A &nbsp;&middot;&nbsp; The Promise to Our Venue Partners
            </div>
          </div>
        </div>
      </div>

      {/* ── TIERS ── */}
      <section className="sura-tiers" id="sura-tiers">
        <div className="sura-container">
          <div {...reveal()}>
            <div className="sura-sec-label">
              Service Tiers<span className="sura-rule" />
            </div>
            <h2 className="sura-sec-h2">
              Three tiers of
              <br />
              <em>the royal table</em>
            </h2>
          </div>
          <div className="sura-tier-grid">
            {TIERS.map((tier, i) => (
              <div
                key={tier.name}
                {...reveal(i + 1, `sura-tier-card${tier.featured ? ' sura-featured' : ''}`)}
              >
                {tier.featured && (
                  <div className="sura-tier-featured-badge">Most Requested</div>
                )}
                <span className="sura-tier-badge">{tier.badge}</span>
                <div className="sura-tier-name">{tier.name}</div>
                <span className="sura-tier-ko">{tier.ko}</span>
                <ul className="sura-tier-list">
                  {tier.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="sura-tier-for">{tier.forText}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VENUE PARTNERS ── */}
      <section className="sura-venue" id="sura-venue">
        <div className="sura-container">
          <div className="sura-venue-inner">
            <div {...reveal()}>
              <div className="sura-sec-label">
                For Venues &amp; Hotels<span className="sura-rule" />
              </div>
              <h2 className="sura-sec-h2">
                Your venue.
                <br />
                Our kitchen.
                <br />
                <em>
                  One extraordinary
                  <br />
                  experience.
                </em>
              </h2>
              <div className="sura-gold-divider" />
              <p className="sura-story-body">
                SURA is designed as a venue-first program. We supply at wholesale
                — you present to your clients at your price point. Our Signature
                tier adds $2,750–$3,750 in net margin on a 50-guest event, with
                zero kitchen or staffing overhead.
              </p>
              <div className="sura-venue-stats">
                {STATS.map((s) => (
                  <div className="sura-stat-box" key={s.num}>
                    <div className="sura-stat-num">{s.num}</div>
                    <div className="sura-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div {...reveal(2)}>
              <div className="sura-sec-label">
                Partnership Models<span className="sura-rule" />
              </div>
              <div className="sura-venue-model">
                {MODELS.map((m) => (
                  <div className="sura-model-item" key={m.label}>
                    <div className="sura-model-label">{m.label}</div>
                    <div className="sura-model-text">
                      <strong>{m.text}</strong>
                      {m.desc}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40 }}>
                <div className="sura-sec-label">
                  Serving These Venues<span className="sura-rule" />
                </div>
                <p className="sura-story-body" style={{ fontSize: 15 }}>
                  W Hoboken &middot; Westin Jersey City &middot; Envue Autograph
                  Collection &middot; Canopy by Hilton Arts District &middot; Hudson
                  House &middot; The Atelier on the Hudson &middot; and select
                  partners across the NYC Metro.
                </p>
              </div>
              <div style={{ marginTop: 36 }}>
                <a href="#sura-contact" className="sura-btn-primary">
                  Request a Complimentary Tasting
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="sura-cta-section" id="sura-contact">
        <div className="sura-cta-bg-char">{'수라'}</div>
        <div {...reveal(undefined, 'sura-cta-inner')}>
          <div className="sura-cta-eyebrow">Begin the Conversation</div>
          <h2 className="sura-cta-h2">
            Ready to bring
            <br />
            <em>the royal table</em>
            <br />
            to your venue?
          </h2>
          <p className="sura-cta-sub">
            Let&apos;s begin with a tasting. No commitment, no paperwork — just
            45 minutes to experience SURA for yourselves.
          </p>
          <div className="sura-cta-buttons">
            <a
              href="mailto:hello@damausa.com?subject=SURA Venue Partnership Inquiry"
              className="sura-btn-primary"
            >
              Request a Tasting &rarr;
            </a>
            <Link href="/catering" className="sura-btn-ghost">
              Party Catering
            </Link>
          </div>
          <div className="sura-cta-contact">
            <div className="sura-cta-contact-grid">
              {[
                ['Email', 'hello@damausa.com'],
                ['Website', 'www.damausa.com'],
                ['Studio', 'Fort Lee & Jersey City, NJ'],
                ['Serving', 'Greater NYC Metro'],
              ].map(([label, val]) => (
                <div className="sura-contact-item" key={label}>
                  <span className="sura-contact-item-label">{label}</span>
                  <div className="sura-contact-item-val">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────
   Scoped styles — dark navy / gold luxury theme
   All classes prefixed with "sura-" to avoid
   collision with the main DAM:A theme.
   ──────────────────────────────────────────── */
const suraStyles = `
/* ── Variables ── */
.sura-theme {
  --sura-navy: #0d1829;
  --sura-navy2: #162036;
  --sura-navy3: #1e2d47;
  --sura-gold: #c9a96e;
  --sura-gold2: #e8cd9a;
  --sura-gold3: #f5edd8;
  --sura-ivory: #f7f2ea;
  --sura-ivory2: #ede5d2;
  --sura-mid: #8a7e6a;
  --sura-rule: rgba(201,169,110,0.2);
  --sura-rule2: rgba(201,169,110,0.1);

  background: var(--sura-navy);
  color: var(--sura-ivory);
  font-family: 'Cormorant Garamond', var(--font-cormorant), Georgia, serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Shared ── */
.sura-container { max-width: 1100px; margin: 0 auto; padding: 0 60px; }
.sura-theme section { padding: 100px 0; }
.sura-sec-label {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 10px; letter-spacing: .5em; color: var(--sura-gold);
  text-transform: uppercase; margin-bottom: 20px;
  display: flex; align-items: center; gap: 14px;
}
.sura-rule { flex: 1; height: 1px; background: var(--sura-rule); }
.sura-sec-label-center { justify-content: center; }
.sura-sec-label-center .sura-rule { display: none; }
.sura-sec-h2 {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 52px; font-weight: 400; line-height: 1.1;
  color: var(--sura-ivory); margin-bottom: 24px;
}
.sura-sec-h2 em { font-style: italic; color: var(--sura-gold2); }
.sura-gold-divider { width: 64px; height: 1px; background: var(--sura-gold); opacity: .4; margin: 32px 0; }
.sura-dot { color: var(--sura-gold); }

/* ── Animations ── */
.sura-reveal {
  opacity: 0; transform: translateY(28px);
  transition: opacity .8s ease, transform .8s ease;
}
.sura-visible { opacity: 1; transform: translateY(0); }
.sura-delay-1 { transition-delay: .1s; }
.sura-delay-2 { transition-delay: .2s; }
.sura-delay-3 { transition-delay: .3s; }
.sura-delay-4 { transition-delay: .4s; }
.sura-delay-5 { transition-delay: .5s; }

/* ── Buttons ── */
.sura-btn-primary {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 11px; letter-spacing: .28em; text-transform: uppercase;
  color: var(--sura-navy); background: var(--sura-gold);
  padding: 16px 32px; text-decoration: none; display: inline-block;
  transition: background .2s;
}
.sura-btn-primary:hover { background: var(--sura-gold2); }
.sura-btn-ghost {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 11px; letter-spacing: .28em; text-transform: uppercase;
  color: var(--sura-gold); border: 1px solid rgba(201,169,110,.4);
  padding: 15px 28px; text-decoration: none; display: inline-block;
  transition: border-color .2s, color .2s;
}
.sura-btn-ghost:hover { border-color: var(--sura-gold); color: var(--sura-gold2); }

/* ── HERO ── */
.sura-hero {
  min-height: 85vh; display: grid; grid-template-columns: 1fr 1fr;
  position: relative; overflow: hidden;
}
.sura-hero-left {
  display: flex; flex-direction: column; justify-content: center;
  padding: 120px 72px 80px; position: relative; z-index: 2;
}
.sura-hero-eyebrow {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 10px; letter-spacing: .5em; color: var(--sura-gold);
  text-transform: uppercase; margin-bottom: 28px;
  display: flex; align-items: center; gap: 14px;
}
.sura-hero-eyebrow::after {
  content: ''; width: 48px; height: 1px; background: var(--sura-gold); opacity: .5;
}
.sura-hero-title {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 88px; font-weight: 900; line-height: .88;
  letter-spacing: -.02em; color: var(--sura-ivory); margin-bottom: 12px;
}
.sura-hero-title-ko {
  font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
  font-size: 44px; font-weight: 300; color: rgba(201,169,110,.45);
  letter-spacing: .08em; margin-bottom: 36px;
}
.sura-hero-desc {
  font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
  font-style: italic; font-size: 20px; line-height: 1.65;
  color: var(--sura-gold3); max-width: 420px; margin-bottom: 48px;
  padding-left: 18px; border-left: 2px solid rgba(201,169,110,.4);
}
.sura-hero-actions { display: flex; gap: 16px; align-items: center; }
.sura-hero-right { position: relative; overflow: hidden; }
.sura-hero-img { object-fit: cover; object-position: center top; }
.sura-hero-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(90deg, var(--sura-navy) 0%, rgba(13,24,41,.15) 35%, transparent 60%);
}

/* ── STORY ── */
.sura-story { background: var(--sura-navy2); }
.sura-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.sura-story-number {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 160px; font-weight: 900; color: rgba(201,169,110,.06);
  line-height: 1; margin-bottom: -40px; display: block;
}
.sura-story-h3 {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 34px; font-weight: 400; line-height: 1.2;
  color: var(--sura-ivory); margin-bottom: 20px;
}
.sura-story-h3 em { font-style: italic; color: var(--sura-gold2); }
.sura-story-body {
  font-size: 17px; line-height: 2; color: var(--sura-ivory2); margin-bottom: 16px;
}
.sura-story-body em { font-style: italic; color: var(--sura-gold2); }
.sura-pull {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-style: italic; font-size: 24px; line-height: 1.5;
  color: var(--sura-gold2); border-left: 2px solid var(--sura-gold);
  padding: 4px 0 4px 24px; margin: 32px 0;
}
.sura-story-card {
  background: rgba(201,169,110,.06); border: 1px solid var(--sura-rule);
  padding: 28px 32px; margin-top: 32px;
}
.sura-story-card-ko {
  font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
  font-size: 18px; color: var(--sura-gold2); line-height: 1.8; margin-bottom: 12px;
}
.sura-story-card-en {
  font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
  font-style: italic; font-size: 16px; color: var(--sura-mid); line-height: 1.7;
}

/* ── EXPERIENCE ── */
.sura-experience { background: var(--sura-navy); }
.sura-exp-intro { text-align: center; max-width: 620px; margin: 0 auto 64px; }
.sura-exp-body { font-size: 17px; line-height: 1.85; color: var(--sura-ivory2); margin-top: 16px; }
.sura-exp-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 8px; }
.sura-exp-card {
  background: rgba(255,255,255,.018); border: 1px solid rgba(201,169,110,.1);
  padding: 36px 28px 38px; position: relative; overflow: hidden;
  transition: background .3s; height: 100%;
}
.sura-exp-card:hover { background: rgba(201,169,110,.06); }
.sura-exp-card::after {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--sura-gold); opacity: 0; transition: opacity .3s;
}
.sura-exp-card:hover::after { opacity: 1; }
.sura-exp-roman {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 11px; letter-spacing: .4em; color: rgba(201,169,110,.4);
  text-transform: uppercase; margin-bottom: 18px; display: block;
}
.sura-exp-title {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 22px; font-weight: 500; color: var(--sura-ivory);
  margin-bottom: 12px; line-height: 1.2;
}
.sura-exp-desc { font-size: 14px; line-height: 1.85; color: var(--sura-mid); }

/* ── PROMISE ── */
.sura-promise { margin-top: 64px; }
.sura-promise-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 16px; }
.sura-promise-item {
  font-size: 14px; line-height: 1.85; color: var(--sura-ivory2);
  padding: 20px 24px; border: 1px solid var(--sura-rule2);
  background: rgba(255,255,255,.015);
}
.sura-promise-bold { color: var(--sura-gold2); font-weight: 600; }

/* ── PHOTO FEATURE ── */
.sura-photo-feature { background: var(--sura-navy2); overflow: hidden; }
.sura-photo-feature-inner { display: grid; grid-template-columns: 1fr 1fr; min-height: 560px; }
.sura-photo-feature-img { position: relative; overflow: hidden; min-height: 400px; }
.sura-photo-feature-content { padding: 80px 72px; display: flex; flex-direction: column; justify-content: center; }
.sura-feature-quote {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-style: italic; font-size: 32px; line-height: 1.4;
  color: var(--sura-gold2); margin-bottom: 32px; position: relative;
}
.sura-feature-quote::before {
  content: '\\201C'; font-size: 80px; line-height: .2;
  color: rgba(201,169,110,.25); display: block; margin-bottom: 16px;
  font-style: normal;
}
.sura-feature-sub { font-size: 16px; line-height: 1.85; color: var(--sura-ivory2); margin-bottom: 32px; }
.sura-feature-attr {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 9px; letter-spacing: .4em; color: var(--sura-mid);
  text-transform: uppercase; padding-top: 20px;
  border-top: 1px solid var(--sura-rule2); display: inline-block;
}

/* ── TIERS ── */
.sura-tiers { background: var(--sura-navy); }
.sura-tier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 48px; }
.sura-tier-card {
  background: rgba(255,255,255,.015); border: 1px solid rgba(201,169,110,.1);
  padding: 36px 28px 40px; transition: background .3s; position: relative;
}
.sura-tier-card:hover { background: rgba(201,169,110,.04); }
.sura-featured {
  background: rgba(201,169,110,.07); border-color: rgba(201,169,110,.32);
}
.sura-tier-featured-badge {
  position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 8.5px; letter-spacing: .3em; text-transform: uppercase;
  background: var(--sura-gold); color: var(--sura-navy); padding: 5px 16px;
  white-space: nowrap;
}
.sura-tier-badge {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 9px; letter-spacing: .38em; color: var(--sura-gold);
  text-transform: uppercase; margin-bottom: 14px; display: block;
}
.sura-tier-name {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 26px; font-weight: 500; color: var(--sura-ivory);
  line-height: 1.1; margin-bottom: 4px;
}
.sura-tier-ko { font-size: 13px; color: rgba(201,169,110,.6); display: block; margin-bottom: 20px; }
.sura-tier-list { margin-bottom: 24px; }
.sura-tier-list li {
  list-style: none; font-size: 14px; line-height: 1.85;
  color: var(--sura-ivory2); padding: 5px 0 5px 16px;
  position: relative; border-bottom: 1px solid var(--sura-rule2);
}
.sura-tier-list li::before {
  content: '\\2014'; position: absolute; left: 0;
  color: rgba(201,169,110,.4); font-size: 12px;
}
.sura-tier-for {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 9.5px; letter-spacing: .18em; color: var(--sura-mid);
  text-transform: uppercase; line-height: 1.7; margin-top: 16px;
}

/* ── VENUE ── */
.sura-venue { background: var(--sura-navy2); }
.sura-venue-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }
.sura-venue-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 40px; }
.sura-stat-box {
  background: rgba(255,255,255,.02); border: 1px solid var(--sura-rule2); padding: 24px 22px;
}
.sura-stat-num {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 44px; font-weight: 700; color: var(--sura-gold); line-height: 1; margin-bottom: 6px;
}
.sura-stat-label { font-size: 13px; color: var(--sura-mid); line-height: 1.6; }
.sura-venue-model { margin-top: 40px; }
.sura-model-item {
  padding: 20px 24px; border: 1px solid var(--sura-rule2);
  margin-bottom: 2px; display: grid; grid-template-columns: auto 1fr;
  gap: 20px; align-items: start; background: rgba(255,255,255,.015);
}
.sura-model-label {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 9px; letter-spacing: .3em; text-transform: uppercase;
  color: var(--sura-gold); white-space: nowrap; padding-top: 3px;
}
.sura-model-text { font-size: 14px; line-height: 1.7; color: var(--sura-ivory2); }
.sura-model-text strong { color: var(--sura-gold2); font-weight: normal; }

/* ── CTA ── */
.sura-cta-section {
  background: var(--sura-navy3); text-align: center; padding: 120px 60px;
  position: relative; overflow: hidden;
}
.sura-cta-bg-char {
  position: absolute; left: 50%; top: 50%;
  transform: translate(-50%, -55%);
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 400px; font-weight: 900;
  color: rgba(201,169,110,.03); line-height: 1;
  pointer-events: none; user-select: none; white-space: nowrap;
}
.sura-cta-inner { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; }
.sura-cta-eyebrow {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 10px; letter-spacing: .5em; color: var(--sura-gold);
  text-transform: uppercase; margin-bottom: 24px;
}
.sura-cta-h2 {
  font-family: 'Playfair Display', var(--font-cormorant), Georgia, serif;
  font-size: 52px; font-weight: 400; line-height: 1.1;
  color: var(--sura-ivory); margin-bottom: 20px;
}
.sura-cta-h2 em { font-style: italic; color: var(--sura-gold2); }
.sura-cta-sub { font-style: italic; font-size: 18px; line-height: 1.7; color: var(--sura-ivory2); margin-bottom: 48px; }
.sura-cta-buttons { display: flex; gap: 16px; justify-content: center; }
.sura-cta-contact { margin-top: 52px; padding-top: 40px; border-top: 1px solid var(--sura-rule2); }
.sura-cta-contact-grid { display: flex; gap: 48px; justify-content: center; flex-wrap: wrap; }
.sura-contact-item { text-align: center; }
.sura-contact-item-label {
  font-family: var(--font-dm-sans), 'Tenor Sans', sans-serif;
  font-size: 9px; letter-spacing: .38em; color: var(--sura-gold);
  text-transform: uppercase; display: block; margin-bottom: 6px;
}
.sura-contact-item-val { font-size: 15px; color: var(--sura-ivory2); }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .sura-hero { grid-template-columns: 1fr; min-height: auto; }
  .sura-hero-left { padding: 100px 28px 60px; }
  .sura-hero-right { height: 50vw; min-height: 300px; }
  .sura-hero-img-overlay {
    background: linear-gradient(180deg, var(--sura-navy) 0%, rgba(13,24,41,.2) 40%, transparent 70%);
  }
  .sura-hero-title { font-size: 64px; }
  .sura-hero-title-ko { font-size: 32px; }
  .sura-container { padding: 0 28px; }
  .sura-theme section { padding: 72px 0; }
  .sura-story-grid,
  .sura-photo-feature-inner,
  .sura-venue-inner { grid-template-columns: 1fr; }
  .sura-photo-feature-img { min-height: 60vw; }
  .sura-photo-feature-content { padding: 48px 28px; }
  .sura-exp-grid { grid-template-columns: 1fr; }
  .sura-tier-grid { grid-template-columns: 1fr; }
  .sura-promise-grid { grid-template-columns: 1fr; }
  .sura-venue-stats { grid-template-columns: 1fr; }
  .sura-cta-h2 { font-size: 36px; }
  .sura-sec-h2 { font-size: 36px; }
  .sura-cta-buttons { flex-direction: column; align-items: center; }
  .sura-cta-section { padding: 72px 28px; }
  .sura-cta-bg-char { font-size: 200px; }
  .sura-story-number { font-size: 100px; }
}

@media (prefers-reduced-motion: reduce) {
  .sura-reveal { opacity: 1; transform: none; transition: none; }
}

/* ── HEADER OVERRIDES (when on SURA page) ── */
html.sura-page header {
  background: var(--sura-navy, #0d1829) !important;
  border-bottom-color: rgba(201,169,110,0.15) !important;
  transition: background .4s, border-color .4s;
}
html.sura-page header nav a {
  color: rgba(247,242,234,.65) !important;
}
html.sura-page header nav a:hover {
  color: #e8cd9a !important;
}
/* Logo → invert to white */
html.sura-page header a[aria-label="DAM:A Home"] img {
  filter: brightness(0) invert(1);
}
/* "Order Now" button */
html.sura-page header a[href="/menu"][class*="bg-dama-green"] {
  background: #c9a96e !important;
  color: #0d1829 !important;
}
html.sura-page header a[href="/menu"][class*="bg-dama-green"]:hover {
  background: #e8cd9a !important;
}
/* Account / Login / Admin links */
html.sura-page header a[href="/login"],
html.sura-page header a[href="/account"],
html.sura-page header a[href="/admin"] {
  color: rgba(247,242,234,.65) !important;
}
html.sura-page header a[href="/login"]:hover,
html.sura-page header a[href="/account"]:hover,
html.sura-page header a[href="/admin"]:hover {
  color: #e8cd9a !important;
}
/* Cart icon */
html.sura-page header button[aria-label*="cart"] {
  color: rgba(247,242,234,.8);
}
html.sura-page header button[aria-label*="cart"]:hover {
  background: rgba(201,169,110,.12);
}
html.sura-page header button[aria-label*="cart"] span {
  background: #c9a96e !important;
  color: #0d1829 !important;
}
/* Hamburger icon bars */
html.sura-page header button[aria-label="Open menu"] span {
  background: rgba(247,242,234,.85) !important;
}
html.sura-page header button[aria-label="Open menu"]:hover {
  background: rgba(201,169,110,.12);
}
/* Scrolled state */
html.sura-page header[class*="backdrop-blur"] {
  background: rgba(13,24,41,0.95) !important;
}
`;
