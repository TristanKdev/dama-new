import type { Metadata } from 'next';
import Link from 'next/link';
import './oyul.css';

export const metadata: Metadata = {
  title: 'OYUL Kimchi Lab — Learn Kimchi With Oh Yul · DAM:A',
  description:
    'A hands-on kimchi class in Jersey City with Oh Yul. Learn the 1,500-year tradition — two hours, one jar, one story. $55 per person, all inclusive.',
  alternates: { canonical: '/oyul-kimchi-lab' },
};

export default function OyulKimchiLabPage() {
  return (
    <div className="oyul-page">
      {/* HERO */}
      <div className="hero">
        <div className="hero-l">
          <div>
            <div className="hl-eye">OYUL Kimchi Lab &middot; DAM:A &middot; Jersey City</div>
            <div className="hl-main">
              <div className="hl-kicker">A hands-on class with</div>
              <h1>Oh Yul&apos;s<br /><em>Kimchi Lab.</em></h1>
              <div className="hl-desc">
                Learn kimchi the way it was meant to be learned &mdash;<br />
                through your hands, not a recipe.<br />
                Two hours. One jar. One story that is 1,500 years old.
              </div>
            </div>
          </div>
          <div className="hl-bottom">
            <div className="stats-bar">
              <div className="stat"><div className="st-n">$55</div><div className="st-l">Per Person</div></div>
              <div className="stat"><div className="st-n">2 hrs</div><div className="st-l">Duration</div></div>
              <div className="stat"><div className="st-n">30</div><div className="st-l">Max Guests</div></div>
              <div className="stat"><div className="st-n">1</div><div className="st-l">Jar to Take Home</div></div>
            </div>
          </div>
        </div>
        <div className="hero-r">
          <div className="hr-top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/oyul/oh-yul-portrait.jpg" alt="Oh Yul — OYUL Kimchi Lab" />
            <div className="name-pill">
              <div className="np-n">Oh Yul &middot; 오율</div>
              <div className="np-r">Artist &middot; Founder &middot; Lead Instructor &middot; OYUL Kimchi Lab</div>
            </div>
          </div>
          <div className="hr-bottom">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/oyul/oyul-kimchi.jpg" alt="OYUL Kimchi" />
          </div>
        </div>
      </div>

      {/* WHY THIS CLASS */}
      <div className="why-strip">
        <div className="ws-label">Why This Class Is Different</div>
        <div className="ws-stmt">
          Most kimchi classes teach you a recipe.<br />
          This one teaches you <strong>why the recipe works.</strong>
        </div>
        <div className="ws-grid">
          <div className="ws-item">
            <div className="wi-n">The Instructor</div>
            <div className="wi-t">An artist, not a chef.</div>
            <div className="wi-b">Oh Yul approaches every ingredient the way a painter approaches color &mdash; with intention, with restraint, and with the understanding that what you leave out matters as much as what you put in.</div>
          </div>
          <div className="ws-item">
            <div className="wi-n">The Kimchi</div>
            <div className="wi-t">Traditional in spirit. Precise in practice.</div>
            <div className="wi-b">Not fusion. Not health food. Kimchi the way it was always meant to taste &mdash; clean, light, crisp. The kind you reach for every day without thinking.</div>
          </div>
          <div className="ws-item">
            <div className="wi-n">The Knowledge</div>
            <div className="wi-t">You leave knowing why, not just how.</div>
            <div className="wi-b">The science of fermentation. The reason for every ingredient. The technique to make it again at home. You came to a class. You leave with a skill.</div>
          </div>
        </div>
      </div>

      {/* KIMJANG */}
      <div className="kimjang">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/oyul/kimjang.jpg" alt="Kimjang" />
        <div className="kj-text">
          <div className="kj-label">Kimjang &middot; UNESCO Intangible Cultural Heritage of Humanity</div>
          <div className="kj-q">&ldquo;I learned kimchi from watching.<br />In this class, you learn by doing.<br />That is the only way it has ever worked.&rdquo;</div>
        </div>
      </div>

      {/* MEET YUL */}
      <div className="sec">
        <div className="sec-eye">Your Instructor</div>
        <h2>The Reason This Class<br />Is Worth Taking.</h2>
        <div className="yul-grid">
          <div className="yul-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/oyul/oh-yul-cooking.jpg" alt="Oh Yul" />
            <div className="yul-cap">
              <div className="yc-n">Oh Yul &middot; 오율</div>
              <div className="yc-r">Artist &middot; Founder &middot; OYUL Kimchi Lab &middot; DAM:A</div>
            </div>
          </div>
          <div className="yul-text">
            <div className="yt-intro">&ldquo;I did not learn kimchi from a recipe. I learned it from watching my grandmother&apos;s hands. That is what I bring into this room.&rdquo;</div>
            <p>Oh Yul grew up beside her grandmother&apos;s restaurant kitchen &mdash; watching the same ritual every morning before the doors opened. Salt the cabbage. Wring out the water. Build the paste. Mix by hand. <strong>No measurements. No timer. Just knowledge that lived in the body.</strong></p>
            <p>In middle school, she spent her afternoons in a cooking club &mdash; and something shifted. She started seeing kimchi not as food, but as form. Color, texture, the visual logic of each ingredient. She was an art student learning to see. That perspective never left her.</p>
            <div className="sep"><div className="sl"></div><div className="sd"></div><div className="sl"></div></div>
            <p>Traditional kimchi was too much for her to eat every day. The weight of the jeotgal. The heat that never softens. She loved it &mdash; but it was not designed for a Tuesday lunch. <strong>So she made something that was.</strong> Cleaner. Lighter. Crisp through weeks of fermentation. The kind that disappears beside bossam before you notice.</p>
            <p>Her grandfather spent forty years researching natural mineral and calcium-rich compounds. She applied his science to every batch &mdash; fermentation that holds, texture that lasts, nutrition intact. <strong>His research. Her grandmother&apos;s hands. Her eye.</strong> That is what you are learning in this class.</p>
          </div>
        </div>
      </div>

      {/* WHAT YOU LEARN */}
      <div className="sec alt">
        <div className="sec-eye">The Curriculum</div>
        <h2>What You Actually Learn<br />in Two Hours.</h2>
        <div className="learn-grid">
          <div className="learn-item">
            <div className="li-num">01</div>
            <div className="li-label">Culture &middot; with Oh Yul</div>
            <div className="li-title">1,500 years in 10 minutes.</div>
            <div className="li-body">Why kimchi is not a trend. The UNESCO recognition of Kimjang &mdash; the collective tradition of making kimchi together. Why South Korea has one of the world&apos;s highest life expectancies. <strong>The story you will tell someone tonight.</strong></div>
            <div className="li-connect">Yul learned this the way all Koreans do &mdash; not from a textbook, but from sitting beside someone who knew. That is how she teaches it.</div>
          </div>
          <div className="learn-item">
            <div className="li-num">02</div>
            <div className="li-label">Science &middot; with Janie (CIA)</div>
            <div className="li-title">Why fermentation works &mdash; in plain language.</div>
            <div className="li-body">Lactobacillus. Osmosis. Why we salt the cabbage first. What the sugar actually does (it is not for sweetness). How live probiotics form, and why homemade kimchi is not the same as store-bought. <strong>The science behind the ritual.</strong></div>
            <div className="li-connect">Yul&apos;s grandfather spent 40 years on this question. She grew up asking it. Now you will too.</div>
          </div>
          <div className="learn-item">
            <div className="li-num">03</div>
            <div className="li-label">Ingredients &middot; Yul&apos;s Method</div>
            <div className="li-title">Six ingredients. Every one with a reason.</div>
            <div className="li-body">Garlic sliced, not crushed &mdash; and why that changes the flavor. Ginger grated by hand. Gochugaru chosen for depth, not aggression. Fish sauce as fermentation fuel, not seasoning. <strong>You will never look at these ingredients the same way again.</strong></div>
            <div className="li-connect">This is Yul&apos;s version &mdash; the one she developed because traditional kimchi was too heavy for every day. Lighter. Cleaner. Still completely Korean.</div>
          </div>
          <div className="learn-item">
            <div className="li-num">04</div>
            <div className="li-label">Technique &middot; Hands In</div>
            <div className="li-title">You make one full head. Yourself.</div>
            <div className="li-body">How to read the cabbage before you start. Building the paste by feel &mdash; not measurement. Coating every leaf, layer by layer, base to tip. Packing the jar. <strong>By the end, your hands know something your brain did not know an hour ago.</strong></div>
            <div className="li-connect">&ldquo;My grandmother never measured anything. She knew by touch. That is what you are learning here &mdash; not a recipe, but a feel.&rdquo;</div>
          </div>
        </div>
      </div>

      {/* CLASS FLOW */}
      <div className="sec">
        <div className="sec-eye">The Session</div>
        <h2>Two Hours.<br />Start to Finish.</h2>
        <div className="flow">
          <div className="flow-steps">
            <div className="flow-step">
              <div className="fs-time">7:30</div>
              <div className="fs-body">
                <div className="fs-title">Welcome &amp; Sikhye</div>
                <div className="fs-desc">Traditional sweet rice drink on arrival. Introductions. You are a stranger for about five minutes.</div>
                <span className="fs-tag">Ice Breaking</span>
              </div>
            </div>
            <div className="flow-step">
              <div className="fs-time">7:35</div>
              <div className="fs-body">
                <div className="fs-title">The Kimchi Story</div>
                <div className="fs-desc">Oh Yul walks you through 1,500 years &mdash; UNESCO Kimjang, Korean longevity, the science underneath the tradition. The fact you will repeat at dinner tonight.</div>
                <span className="fs-tag">Culture &middot; Science</span>
              </div>
            </div>
            <div className="flow-step">
              <div className="fs-time">7:50</div>
              <div className="fs-body">
                <div className="fs-title">Sauce Making &mdash; Chef Demo</div>
                <div className="fs-desc">Yul demonstrates the yangnyeom. You learn each ingredient &mdash; why it is there, what it does, what happens without it. Then you make the paste yourself. Prime photo moment.</div>
                <span className="fs-tag">Technique &middot; Ingredients</span>
              </div>
            </div>
            <div className="flow-step">
              <div className="fs-time">8:10</div>
              <div className="fs-body">
                <div className="fs-title">Personal Kimchi Mixing</div>
                <div className="fs-desc">One full head of cabbage. Your hands. Your paste. Coat every leaf, layer by layer. Name label on the jar. Contest judging begins &mdash; Best Look, Most Unique, Spiciest.</div>
                <span className="fs-tag">Hands-On &middot; The Real Work</span>
              </div>
            </div>
            <div className="flow-step">
              <div className="fs-time">8:30</div>
              <div className="fs-body">
                <div className="fs-title">Tasting Table &mdash; Social Dining</div>
                <div className="fs-desc">Bossam, fresh kimchi tasting, one complimentary oyster, makgeolli. The table opens. Strangers become neighbors. Add-ons available.</div>
                <span className="fs-tag">Social Dining</span>
              </div>
            </div>
            <div className="flow-step">
              <div className="fs-time">8:50</div>
              <div className="fs-body">
                <div className="fs-title">Games, Quiz &amp; Raffle</div>
                <div className="fs-desc">Kimchi culture quiz &mdash; real prizes. Raffle draw. Traditional Korean games. The energy goes up. This is the moment everyone remembers.</div>
                <span className="fs-tag">Play &middot; Community</span>
              </div>
            </div>
            <div className="flow-step">
              <div className="fs-time">9:10</div>
              <div className="fs-body">
                <div className="fs-title">Closing &amp; Take Home</div>
                <div className="fs-desc">Surprise welcome gift for every guest. QR code to the DAM:A store. Group photo with your jars. Session 2 preview.</div>
                <span className="fs-tag">Conversion &middot; Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAKE HOME */}
      <div className="sec alt">
        <div className="sec-eye">What You Leave With</div>
        <h2>More Than a Jar.</h2>
        <div className="take-grid">
          <div className="take-item">
            <span className="ti-e">🫙</span>
            <div className="ti-t">Your Kimchi Jar</div>
            <div className="ti-b">One full head. Made by your hands. DAM:A branded. Your name on the label. Already fermenting. Eat it in 2 days or age it for a month.</div>
          </div>
          <div className="take-item">
            <span className="ti-e">📋</span>
            <div className="ti-t">Yul&apos;s Recipe Card</div>
            <div className="ti-b">The exact OYUL recipe. Ratios. Steps. Make it at home this weekend. You already know how &mdash; your hands remember.</div>
          </div>
          <div className="take-item">
            <span className="ti-e">🌶️</span>
            <div className="ti-t">Seasoning Paste Sample</div>
            <div className="ti-b">A mini packet of OYUL signature yangnyeom. Your taste reference for the next batch. The benchmark you will try to match.</div>
          </div>
          <div className="take-item">
            <span className="ti-e">📅</span>
            <div className="ti-t">Fermentation Cheat Sheet</div>
            <div className="ti-b">Day-by-day guide. What to look for. When to move to fridge. When it is ready. One page. Everything Yul&apos;s grandmother never had to write down.</div>
          </div>
          <div className="take-item">
            <span className="ti-e">💬</span>
            <div className="ti-t">A Story Worth Knowing</div>
            <div className="ti-b">1,500 years. UNESCO. Lactobacillus. Yul&apos;s grandmother. You know it all now. You will tell someone tonight. That is how knowledge travels.</div>
          </div>
          <div className="take-item">
            <span className="ti-e">🎁</span>
            <div className="ti-t">Surprise Gift + 15% Off</div>
            <div className="ti-b">Welcome gift from OYUL Kimchi Lab at the close. QR code to the DAM:A store &mdash; kimchi, banchan, meal kits. Valid 30 days.</div>
          </div>
        </div>
      </div>

      {/* PULL QUOTE */}
      <div className="pull-dark">
        <div className="pd-q">
          <span>My grandmother never measured anything.</span>
          <span>She knew by touch.</span>
          <span>That is what you are learning here &mdash;</span>
          not a recipe, but a feel.
        </div>
        <div className="pd-attr">Oh Yul &middot; OYUL Kimchi Lab &middot; DAM:A &middot; Jersey City &middot; 2026</div>
      </div>

      {/* BOOKING */}
      <div className="booking">
        <div>
          <div className="sec-eye" style={{ color: 'rgba(255,255,255,0.45)' }}>Book Your Session</div>
          <h2>Ready to Get Red?</h2>
          <div className="bk-desc">Sessions are available for residential buildings, corporate teams, schools, and private events throughout Jersey City and Hoboken. Individual tickets also available monthly.</div>
        </div>
        <div className="bk-right">
          <div className="bk-price">
            <div className="bp-n">$55</div>
            <div className="bp-l">Per Person &middot; Includes Everything</div>
          </div>
          <Link href="/contact" className="btn-book">Book Individual Ticket →</Link>
          <Link href="/contact" className="btn-inquire">Inquire About Private Session</Link>
          <div className="bk-detail">
            88 Grand Demonstration Kitchen<br />
            Jersey City, NJ &middot; Monthly Sessions<br />
            Building packages from $2,500
          </div>
        </div>
      </div>
    </div>
  );
}
