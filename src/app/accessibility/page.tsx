import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'DAM:A accessibility commitment — our efforts to ensure our website is accessible to all users.',
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
      <h1 className="font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
        Accessibility Statement
      </h1>
      <p className="mt-2 text-sm text-dama-charcoal/70">Last updated: March 2026</p>

      <div className="mt-10 space-y-8 text-base leading-relaxed text-dama-charcoal/80">
        <section>
          <h2 className="text-lg font-semibold text-dama-charcoal">Our Commitment</h2>
          <p className="mt-2">
            DAM:A is committed to ensuring that our website is accessible to everyone, including people
            with disabilities. We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1
            at the AA level, which defines requirements for making web content more accessible to a wide
            range of people with disabilities.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-dama-charcoal">What We Do</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Provide text alternatives for non-text content such as images</li>
            <li>Ensure our site is navigable using a keyboard</li>
            <li>Use semantic HTML and ARIA landmarks for screen reader compatibility</li>
            <li>Maintain sufficient color contrast throughout the site</li>
            <li>Label all form inputs for assistive technology</li>
            <li>Ensure interactive elements have visible focus indicators</li>
            <li>Design responsive layouts that work across devices and screen sizes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-dama-charcoal">Known Limitations</h2>
          <p className="mt-2">
            While we strive to make every page and feature fully accessible, some third-party content
            or features (such as embedded payment forms) may not be fully within our control. We
            continuously work to improve accessibility across all parts of the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-dama-charcoal">Feedback</h2>
          <p className="mt-2">
            We welcome your feedback on the accessibility of the DAM:A website. If you encounter any
            accessibility barriers or have suggestions for improvement, please contact us:
          </p>
          <ul className="mt-2 space-y-1">
            <li>
              Email:{' '}
              <a href="mailto:hello@damajc.com" className="text-dama-green-600 underline hover:text-dama-green-700">
                hello@damajc.com
              </a>
            </li>
            <li>Phone: (201) 923-0773</li>
          </ul>
          <p className="mt-2">
            We aim to respond to accessibility feedback within 2 business days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-dama-charcoal">Standards</h2>
          <p className="mt-2">
            This website aims to conform to WCAG 2.1 Level AA. These guidelines explain how to make
            web content more accessible for people with disabilities and more user-friendly for everyone.
          </p>
        </section>
      </div>
    </div>
  );
}
