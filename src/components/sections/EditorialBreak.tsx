export function EditorialBreak() {
  return (
    <section className="bg-dama-black py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <blockquote>
          <p className="font-cormorant text-2xl italic leading-relaxed text-dama-cream md:text-4xl">
            &ldquo;What you choose to eat shapes how you live. We believe in food that balances
            flavor, nutrition, and intention — Korean wellness, one meal at a time.&rdquo;
          </p>
          <footer className="mt-8">
            <cite className="not-italic">
              <span className="text-sm font-medium text-dama-green-400">DAM:A</span>
              <span className="text-dama-cream/50"> &middot; </span>
              <span className="text-sm text-dama-cream/50">Contain Wellness</span>
            </cite>
          </footer>
        </blockquote>

        {/* Chilcheopbansang brand story */}
        <div className="mt-16 border-t border-dama-cream/10 pt-12">
          <p className="font-noto-kr text-sm text-dama-green-400">칠첩반상</p>
          <h3 className="mt-1 font-cormorant text-xl font-semibold text-dama-cream md:text-2xl">
            Chilcheopbansang: The Seven-Dish Korean Table
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-dama-cream/60">
            In Korean tradition, a proper table is set with at least seven dishes — the
            chilcheopbansang. It is not about abundance for its own sake, but about balance:
            vegetables, proteins, fermented foods, grains, and pickled sides working together
            in harmony. Every DAM:A meal is built on this principle. When you open your dosirak,
            you are not just eating a meal — you are sitting at a table that has been set with
            centuries of intention.
          </p>
        </div>
      </div>
    </section>
  );
}
