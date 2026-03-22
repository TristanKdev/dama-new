import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'DAM:A privacy policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-dama-cream py-16 md:py-24">
      <article className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-dama-charcoal/50">Last updated: February 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-dama-charcoal/70">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">1. Information We Collect</h2>
            <p>When you use DAM:A, we may collect the following information:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Name, email address, and phone number when you place an order or create an account</li>
              <li>Delivery address and building information</li>
              <li>Order history and preferences</li>
              <li>Payment information (processed securely through our payment provider)</li>
              <li>Communications you send to us</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Process and deliver your orders</li>
              <li>Manage your subscription</li>
              <li>Communicate order updates and delivery notifications</li>
              <li>Improve our products and services</li>
              <li>Send promotional communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share information with:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Delivery partners to fulfill your orders</li>
              <li>Payment processors to handle transactions</li>
              <li>Service providers who assist our operations</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">5. Your Rights</h2>
            <p>You may request to access, update, or delete your personal information by contacting us at hello@damajc.com.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-dama-charcoal">6. Contact</h2>
            <p>For privacy-related questions, contact us at hello@damajc.com or (201) 630-0530.</p>
          </section>
        </div>
      </article>
    </div>
  );
}
