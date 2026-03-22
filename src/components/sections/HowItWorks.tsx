const steps = [
  { number: '01', title: 'Browse', description: 'Check this week\'s rotating menu of banchan and dosirak sets.' },
  { number: '02', title: 'Order', description: 'Add to cart, pick your delivery date (Tue/Thu/Sat), and check out by 10 PM.' },
  { number: '03', title: 'We Prepare', description: 'Our kitchen makes everything fresh the morning of delivery.' },
  { number: '04', title: 'Enjoy', description: 'Delivered to your building lobby in reusable containers. Return empties next time.' },
];

export function HowItWorks() {
  return (
    <section className="bg-dama-cream py-16 md:py-24" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium text-dama-green-600">Simple as that</p>
          <h2 id="how-it-works-heading" className="mt-2 font-cormorant text-3xl font-semibold text-dama-charcoal md:text-4xl">
            How It Works
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center md:text-left">
              <div className="mb-4 inline-flex items-center justify-center">
                <span className="relative font-cormorant text-6xl font-bold text-dama-green-400/20">
                  {step.number}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-dama-charcoal">{step.title}</h3>
              <p className="text-sm leading-relaxed text-dama-charcoal/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
