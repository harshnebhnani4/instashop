import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import { InstagramIcon, Reveal } from "./primitives";
import { SellerDialog } from "./SellerDialog";
import { images } from "@/data/shops";
import { cn } from "@/lib/utils";

export function SellerCTA() {
  return (
    <section className="bg-forest-grad grain relative overflow-hidden px-5 py-28 text-forest-foreground">
      <div aria-hidden className="absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-b-full bg-amaranth/40 blur-3xl" />
      <div aria-hidden className="absolute left-1/2 top-0 h-1 w-80 -translate-x-1/2 bg-amaranth shadow-glow" />
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-12 flex max-w-md items-center justify-between">
          <span className="bg-rose-grad grid h-16 w-16 place-items-center rounded-2xl text-primary-foreground"><InstagramIcon className="h-8 w-8" /></span>
          <svg viewBox="0 0 200 20" className="mx-2 h-6 flex-1" aria-hidden>
            <line x1="0" y1="10" x2="200" y2="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
            <line x1="0" y1="10" x2="200" y2="10" stroke="var(--amaranth)" strokeWidth="3" strokeDasharray="60 340" style={{ animation: "beam 2s linear infinite" }} />
          </svg>
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cream font-display text-lg font-extrabold text-primary">is</span>
        </div>
        <Reveal>
          <h2 className="text-5xl font-extrabold leading-[0.95] sm:text-8xl">
            Turn your followers into <span className="font-serif font-medium italic text-amaranth">customers.</span>
          </h2>
        </Reveal>
        <SellerDialog>
          <button className="shimmer mt-10 inline-block rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-glow">Open your shop free</button>
        </SellerDialog>
      </div>
    </section>
  );
}

const reviews = [
  ["Ananya, Pune", "Found three tiny jewellery brands I'd never have discovered. Checkout was so smooth!", "buyer"],
  ["@gulabo.studio", "Stopped answering 200 DMs a day. Orders just come in now.", "seller"],
  ["Riya, Delhi", "Finally I can trust the small Insta shops — returns actually work.", "buyer"],
  ["@kesarglow", "Our Instashop link in bio doubled sales in a month.", "seller"],
  ["Meher, Bengaluru", "It's like Nykaa but for all the cute indie brands. Obsessed.", "buyer"],
  ["@chappal.club", "Setup took 10 minutes. Seriously.", "seller"],
];

export function Reviews() {
  const pics = Object.values(images);
  return (
    <section className="overflow-hidden py-24">
      <Reveal className="mx-auto mb-12 max-w-7xl px-5">
        <h2 className="text-5xl font-extrabold sm:text-7xl">Loved by <span className="font-serif font-medium italic text-primary">both sides</span></h2>
      </Reveal>
      <div className="pause-hover flex" style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}>
        <div className="marquee-track flex shrink-0 gap-4 py-6 pr-4 sm:gap-6 sm:pr-6" style={{ ["--marquee-dur" as string]: "50s" }}>
          {[...reviews, ...reviews].map(([n, t, k], i) => (
            <figure key={i} className={cn("w-56 shrink-0 bg-card p-4 pb-6 shadow-card sm:w-72", i % 2 ? "sm:rotate-2" : "sm:-rotate-2")}>
              <img src={pics[i % pics.length]} alt="" loading="lazy" className="aspect-square w-full object-cover" />
              <div className="mt-3 flex gap-0.5 text-gold">{Array.from({ length: 5 }).map((_, s) => <Star key={s} className="h-4 w-4 fill-current" />)}</div>
              <blockquote className="mt-2 font-serif text-base italic leading-snug sm:text-lg">"{t}"</blockquote>
              <figcaption className="mt-3 flex items-center justify-between text-sm font-semibold">
                {n}
                <span className={cn("rounded-full px-2 py-0.5 text-xs", k === "seller" ? "bg-secondary text-secondary-foreground" : "bg-blush")}>{k}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["60%", "0%"]);
  const cols = { Shop: ["New in", "Trending", "Categories", "Gift cards"], Sellers: ["Start selling", "Pricing", "Seller guide", "Success stories"], Help: ["Orders", "Returns", "Contact", "FAQ"] };
  return (
    <footer ref={ref} className="relative overflow-hidden bg-gradient-to-b from-background to-blush pb-20 pt-16 md:pb-0 md:pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 sm:gap-x-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-3xl font-extrabold">Get the drop first.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex max-w-sm rounded-full bg-card p-1.5 shadow-card">
            <input type="email" required placeholder="you@email.com" aria-label="Email" className="flex-1 bg-transparent px-4 text-sm outline-none" />
            <button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Subscribe</button>
          </form>
          <div className="mt-6 flex gap-3">
            {["Instagram", "YouTube", "X"].map((s) => (
              <a key={s} href="#" aria-label={s} className="grid h-10 w-10 place-items-center rounded-full bg-card text-xs font-bold transition-colors hover:bg-primary hover:text-primary-foreground">
                {s === "Instagram" ? <InstagramIcon className="h-4 w-4" /> : s[0]}
              </a>
            ))}
          </div>
        </div>
        {Object.entries(cols).map(([h, ls]) => (
          <div key={h}>
            <p className="font-bold">{h}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">{ls.map((l) => <li key={l}><a href="#" className="hover:text-primary">{l}</a></li>)}</ul>
          </div>
        ))}
      </div>
      <motion.p style={{ y }} aria-hidden className="mt-12 select-none whitespace-nowrap text-center font-display text-[15vw] font-extrabold leading-[0.8] text-primary sm:mt-16 sm:text-[19vw]">
        INSTASHOP
      </motion.p>
    </footer>
  );
}
