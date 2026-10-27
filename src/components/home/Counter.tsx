import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import crochet from "@/assets/products/crochet.png";
import hoodie from "@/assets/products/hoodie.png";
import denim from "@/assets/products/denim.png";
import shoes from "@/assets/products/shoes.png";
import bomber from "@/assets/products/bomber.png";
import winter from "@/assets/products/winter.png";

const picks = [
  { name: "Crochet bralette", price: 1299, handle: "haathse.handmade", image: crochet },
  { name: "Pink hoodie", price: 1799, handle: "rangrez.label", image: hoodie },
  { name: "Pink denim jacket", price: 2899, handle: "gulabo.studio", image: denim },
  { name: "Blush sneakers", price: 2499, handle: "sneakbazaar", image: shoes },
  { name: "Pink puffer jacket", price: 3299, handle: "rangrez.label", image: bomber },
  { name: "Colourblock windcheater", price: 2199, handle: "gulabo.studio", image: winter },
];

// Card height used in the layout and in the gap-removal maths below
const CARD_H = "min(72vh, 600px)";
// Empty space above/below the cards inside the 100svh slider
const SLIDER_GAP = `((100svh - ${CARD_H}) / 2)`;

export function CounterPicks() {
  const titleRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLSpanElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (bandRef.current) {
        gsap.fromTo(
          bandRef.current,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 1.1, delay: 0.2, ease: "power3.inOut" },
        );
      }
      if (titleRef.current) {
        gsap.timeline({ scrollTrigger: { trigger: titleRef.current, start: "top top", end: "bottom top", scrub: true } })
          .to(titleRef.current.querySelector(".ctr-l1"), { xPercent: -6, ease: "none" }, 0)
          .to(titleRef.current.querySelector(".ctr-l3"), { xPercent: 6, ease: "none" }, 0);
      }

      const track = trackRef.current;
      const slider = sliderRef.current;
      if (!track || !slider) return;
      const distance = () => track.scrollWidth - window.innerWidth;
      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: slider,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => { if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress }); },
        },
      });

      gsap.utils.toArray<HTMLElement>(".ctr-card").forEach((card) => {
        const wrap = card.querySelector(".ctr-img-wrap");
        if (!wrap) return;
        gsap.fromTo(
          wrap,
          { rotate: -6, yPercent: 6 },
          { rotate: 6, yPercent: -6, ease: "none", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left right", end: "right left", scrub: true } },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={titleRef} className="relative overflow-hidden px-5 pt-20 text-center sm:pt-28">
        <div>
          <h2 className="text-[13vw] font-extrabold leading-[0.92] sm:text-8xl lg:text-[7rem]">
            <span className="ctr-l1 block">This week's</span>
            <span ref={bandRef} className="my-2 inline-block -rotate-2 bg-foreground px-3 py-1 text-background">top picks</span>
            <span className="ctr-l3 block">from small shops</span>
          </h2>
          <p className="mx-auto mt-7 max-w-md text-lg text-muted-foreground">
            2,400+ sellers, six finds worth stopping for. Keep scrolling to browse the counter.
          </p>
          <span className="mt-4 block text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Scroll</span>
        </div>
      </section>

      <section
        ref={sliderRef}
        aria-label="This week's picks"
        className="relative h-[100svh] overflow-hidden"
        // pulls the slider up so the empty space above the cards disappears (1.5rem gap left)
        style={{ marginTop: `calc(-1 * ${SLIDER_GAP} + 1.5rem)` }}
      >
        <div ref={trackRef} className="flex h-full w-max items-center gap-6 px-6 sm:gap-10 sm:px-20">
          {picks.map((p, i) => (
            <article
              key={p.name}
              tabIndex={0}
              className={cn(
                "ctr-card relative flex h-[min(72vh,600px)] w-[min(60vw,340px)] shrink-0 flex-col items-center justify-center gap-5 transition-transform duration-500 [transition-timing-function:cubic-bezier(.2,.8,.2,1)] hover:-translate-y-2 hover:rotate-0",
                i % 2 ? "rotate-3" : "-rotate-3",
              )}
            >
              <div className="ctr-img-wrap w-full flex-1">
                <img src={p.image} alt={p.name} loading="lazy" className="mx-auto block h-full w-full object-contain" style={{ filter: "drop-shadow(0 30px 40px rgb(0 0 0 / 0.18))" }} />
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-extrabold">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">@{p.handle} · ₹{p.price.toLocaleString("en-IN")}</p>
              </div>
            </article>
          ))}
        </div>
        <div aria-hidden className="absolute bottom-6 left-1/2 h-[3px] w-[min(260px,50vw)] -translate-x-1/2 overflow-hidden rounded-full bg-border">
          <div ref={progressRef} className="h-full w-full origin-left scale-x-0 bg-foreground" />
        </div>
      </section>

      <section
        className="px-5 pb-24 pt-4 text-center sm:pb-32"
        // pulls this section up so the empty space below the cards disappears
        style={{ marginTop: `calc(-1 * ${SLIDER_GAP} + 1rem)` }}
      >
        <h2 className="mx-auto max-w-[16ch] text-4xl font-extrabold leading-tight sm:text-6xl">Love what you see?</h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Follow any shop above and check out in one tap — no DMs, no waiting on a reply.
        </p>
        <a href="#instagram" className="mt-8 inline-block rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]">
          Explore all shops
        </a>
      </section>
    </>
  );
}