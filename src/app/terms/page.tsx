import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'DAM:A terms of service — the terms and conditions governing your use of our services.',
};

export default function TermsPage() {
  return (
    <div className="bg-dama-cream py-16 md:py-24">
      <article className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-dama-charcoal/50">Last updated: February 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-dama-charcoal/70">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">1. Acceptance of Terms</h2>
            <p>By using DAM:A&apos;s website and services, you agree to these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">2. Orders & Payment</h2>
            <p>All orders are subject to availability. Prices are listed in US dollars and may change without notice. Payment is due at the time of ordering. We accept major credit cards and digital payment methods.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">3. Delivery</h2>
            <p>We deliver to eligible buildings in Jersey City on Tuesdays, Thursdays, and Saturdays. Delivery times are approximate (by 12:00 PM). We are not responsible for items left with building staff after delivery.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">4. Cancellations & Refunds</h2>
            <p>Orders may be cancelled before the cutoff time (10 PM the night before delivery). After cutoff, orders are final. Refunds for quality issues will be handled on a case-by-case basis — contact us within 24 hours of delivery.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">5. Subscriptions</h2>
            <p>Subscriptions auto-renew at the chosen frequency (weekly or biweekly). You may pause for up to 4 weeks or cancel at any time from your account. Changes take effect after the current billing cycle.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">6. Container Deposit Program</h2>
            <p>Our glass containers require a refundable deposit. Return clean containers on your next delivery to receive a credit. Unreturned containers after 30 days will have the deposit charged.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">7. Allergens & Dietary Info</h2>
            <p>We label dietary information to the best of our knowledge. Our kitchen handles common allergens including soy, sesame, nuts, shellfish, and eggs. We cannot guarantee allergen-free preparation.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">8. Limitation of Liability</h2>
            <p>DAM:A is not liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid for the specific order in question.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">9. Contact</h2>
            <p>For questions about these terms, contact us at hello@damajc.com.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
