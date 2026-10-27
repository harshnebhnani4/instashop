import { useEffect, useRef, useState } from "react";
import { Search, ShoppingBag, Home, Compass, Store, User, Sparkles } from "lucide-react";
import { categories, shops } from "@/data/shops";
import { Reveal, Tilt } from "./primitives";
import { SellerDialog } from "./SellerDialog";
import { cn } from "@/lib/utils";

export function AnnouncementBar() {
  const items = ["Become a seller now", "Instashop goes live on 1 January"];
  const loop = [...items, ...items, ...items];
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-9 overflow-hidden bg-foreground text-background">
      <div className="pause-hover flex h-full">
        <div className="marquee-track flex h-full shrink-0 items-center gap-10 whitespace-nowrap pr-10" style={{ ["--marquee-dur" as string]: "26s" }}>
          {[...loop, ...loop].map((t, i) => (
            <span key={i} className="flex items-center gap-10 text-xs font-semibold uppercase tracking-[0.15em]">
              {t}
              <span aria-hidden className="text-background/40">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <header className="fixed inset-x-0 top-9 z-50 flex justify-center px-3 pt-3">
        <nav
          className={cn(
            "glass flex w-full items-center justify-between rounded-full transition-all duration-500",
            scrolled ? "max-w-4xl px-4 py-2 shadow-card" : "max-w-6xl px-6 py-3",
          )}
        >
          <a href="/" className="font-display text-xl font-extrabold tracking-tight">
            insta<span className="text-primary">shop</span>
          </a>
          <ul className="hidden items-center gap-6 text-sm font-medium md:flex">
            {["Shop", "Instagram Shops", "Categories", "Sell on Instashop"].map((l) => (
              <li key={l}>
                <a href={`#${l.split(" ")[0].toLowerCase()}`} className="transition-colors hover:text-primary">{l}</a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"><Search className="h-4 w-4" /></button>
            <button aria-label="Cart" className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"><ShoppingBag className="h-4 w-4" /></button>
            <SellerDialog>
              <button className="hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow sm:inline-block">Start Selling</button>
            </SellerDialog>
          </div>
        </nav>
      </header>
      <nav aria-label="Mobile" className="glass fixed inset-x-4 bottom-4 z-50 flex justify-around rounded-full py-2 shadow-card md:hidden">
        {[[Home, "Home"], [Compass, "Explore"], [Store, "Shops"], [ShoppingBag, "Cart"], [User, "Profile"]].map(([I, l], i) => {
          const Icon = I as typeof Home;
          return (
            <a key={l as string} href="#" className={cn("flex flex-col items-center gap-0.5 rounded-full px-3 py-1 text-[10px] font-medium", i === 0 && "text-primary")}>
              <Icon className="h-5 w-5" />
              {l as string}
            </a>
          );
        })}
        <SellerDialog>
          <button aria-label="Become a seller" className="flex flex-col items-center gap-0.5 rounded-full px-3 py-1 text-[10px] font-medium text-primary">
            <Sparkles className="h-5 w-5" />
            Sell
          </button>
        </SellerDialog>
      </nav>
    </>
  );
}

const HERO_WORD = "instashop";
const HERO_FONT = '"Bricolage Grotesque", ui-sans-serif, system-ui, sans-serif';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const maskBgRef = useRef<SVGRectElement>(null);
  const maskFullRef = useRef<SVGRectElement>(null);
  const wordRef = useRef<SVGTextElement>(null);
  const outlineRef = useRef<SVGTextElement>(null);
  const measureRef = useRef<SVGTextElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    const video = videoRef.current;
    const maskBg = maskBgRef.current;
    const maskFull = maskFullRef.current;
    const word = wordRef.current;
    const outline = outlineRef.current;
    const measure = measureRef.current;
    const intro = introRef.current;
    const scrim = scrimRef.current;
    const after = afterRef.current;
    const bar = barRef.current;
    if (!section || !svg || !video || !maskBg || !maskFull || !word || !outline || !measure || !intro || !scrim || !after || !bar) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    [word, outline, measure].forEach((t) => t.setAttribute("font-family", HERO_FONT));

    let W = 0, H = 0, cx = 0, cy = 0, ox = 0, oy = 0, S = 40;

    function stemOfI(size: number) {
      const pad = Math.ceil(size * 0.3);
      const side = Math.ceil(size * 1.6);
      const c = document.createElement("canvas");
      c.width = side;
      c.height = side;
      const g = c.getContext("2d");
      if (!g) return null;
      g.font = `800 ${size}px ${HERO_FONT}`;
      g.textBaseline = "middle";
      g.textAlign = "left";
      g.fillStyle = "#000";
      g.fillText("i", pad, side / 2);
      const d = g.getImageData(0, 0, side, side).data;
      const on = (x: number, y: number) => (d[(y * side + x) * 4 + 3] ?? 0) > 160;
      const row = Math.floor(side / 2);
      let x0 = -1, x1 = -1;
      for (let x = 0; x < side; x++) if (on(x, row)) { if (x0 < 0) x0 = x; x1 = x; }
      if (x0 < 0) return null;
      const col = Math.floor((x0 + x1) / 2);
      let y0 = -1, y1 = -1;
      for (let y = 0; y < side; y++) if (on(col, y)) { if (y0 < 0) y0 = y; y1 = y; }
      return { w: x1 - x0 + 1, h: y1 - y0 + 1, cx: (x0 + x1) / 2 - pad, cy: (y0 + y1) / 2 - side / 2 };
    }

    function layout() {
      W = svg!.clientWidth;
      H = svg!.clientHeight;
      if (!W || !H) { requestAnimationFrame(layout); return; }
      svg!.setAttribute("viewBox", `0 0 ${W} ${H}`);
      [maskBg, maskFull].forEach((el) => { el!.setAttribute("width", String(W)); el!.setAttribute("height", String(H)); });
      cx = W / 2;
      cy = H * 0.46;
      measure!.setAttribute("font-weight", "800");
      measure!.setAttribute("font-size", "100");
      measure!.setAttribute("x", String(cx));
      measure!.setAttribute("y", String(cy));
      const len = measure!.getComputedTextLength() || 1;
      const size = Math.min(((W * 0.92) / len) * 100, H * 0.42);
      [word, outline, measure].forEach((t) => {
        t!.setAttribute("font-weight", "800");
        t!.setAttribute("font-size", String(size));
        t!.setAttribute("x", String(cx));
        t!.setAttribute("y", String(cy));
      });
      let box: DOMRect | null = null;
      try { box = measure!.getExtentOfChar(0); } catch { box = null; }
      const stem = stemOfI(size);
      if (box && stem) {
        ox = box.x + stem.cx;
        oy = cy + stem.cy;
        S = 1.15 * Math.max((2 * Math.max(ox, W - ox)) / stem.w, (2 * Math.max(oy, H - oy)) / stem.h);
      } else {
        ox = cx; oy = cy; S = 40;
      }
      S = Math.min(S, 45);
      render(true);
    }

    let target = 0, current = 0;
    const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    function readScroll() {
      const r = section!.getBoundingClientRect();
      const total = section!.offsetHeight - window.innerHeight;
      target = clamp(-r.top / Math.max(total, 1));
    }

    function render(_force?: boolean) {
      const p = reduce ? 1 : current;
      const iOut = seg(p, 0.0, 0.12);
      intro!.style.opacity = String(1 - iOut);
      intro!.style.transform = `translateY(${-30 * iOut}px)`;
      intro!.style.visibility = iOut >= 1 ? "hidden" : "visible";
      scrim!.style.opacity = String(1 - seg(p, 0.0, 0.1));
      maskFull!.setAttribute("opacity", (1 - seg(p, 0.04, 0.2)).toFixed(3));
      const z = ease(seg(p, 0.06, 0.7));
      const s = Math.pow(S, 1 - z);
      word!.setAttribute("transform", `translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`);
      const barT = seg(p, 0.1, 0.2);
      bar!.style.color = barT > 0.5 ? "var(--foreground)" : "#FFFFFF";
      outline!.setAttribute("opacity", (0.9 * seg(p, 0.62, 0.78)).toFixed(3));
      const aIn = ease(seg(p, 0.72, 0.9));
      after!.style.opacity = String(aIn);
      after!.style.visibility = aIn > 0.01 ? "visible" : "hidden";
      after!.style.transform = `translateY(${24 * (1 - aIn)}px)`;
    }

    let raf = 0;
    function tick() {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.0005) current = target;
      render();
      raf = requestAnimationFrame(tick);
    }

    const onScroll = () => readScroll();
    const onResize = () => { layout(); readScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    layout();
    readScroll();
    current = target;
    if (document.fonts?.ready) document.fonts.ready.then(layout);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative" style={{ height: "420vh" }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-background">
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/drvug594q/video/upload/v1793118826/Gift_box_opening_with_products_20261027215936_ljc215.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            WebkitMaskImage: "url(#heroWordMask)",
            maskImage: "url(#heroWordMask)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />
        <svg ref={svgRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <mask id="heroWordMask" maskUnits="userSpaceOnUse">
              <rect ref={maskBgRef} x={0} y={0} fill="#000" />
              <rect ref={maskFullRef} x={0} y={0} fill="#fff" />
              <text ref={wordRef} fill="#fff" textAnchor="middle" dominantBaseline="central">{HERO_WORD}</text>
            </mask>
          </defs>
          <text ref={outlineRef} textAnchor="middle" dominantBaseline="central" fill="none" stroke="var(--primary)" strokeWidth={2} opacity={0}>{HERO_WORD}</text>
          <text ref={measureRef} textAnchor="middle" dominantBaseline="central" opacity={0}>{HERO_WORD}</text>
        </svg>

        <div ref={barRef} className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-6 text-white transition-colors sm:px-10">
          <span className="text-sm font-semibold tracking-wide">India's home for Insta brands</span>
        </div>

        <div ref={scrimRef} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-3/5" style={{ background: "linear-gradient(to top, rgba(43,10,28,.62), rgba(43,10,28,.28) 45%, rgba(43,10,28,0))" }} />

        <div ref={introRef} className="absolute inset-x-0 bottom-12 z-[4] px-6 text-center text-white sm:bottom-20" style={{ textShadow: "0 2px 24px rgba(60,0,30,.45)" }}>
          <p className="mx-auto max-w-md text-lg">Shop small Indian brands you already love on Insta — no DMs, no waiting.</p>
          <span className="mt-6 inline-flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Scroll
            <i className="block h-8 w-px" style={{ background: "linear-gradient(#fff, transparent)" }} />
          </span>
        </div>

        <div ref={afterRef} className="absolute inset-x-0 top-[62%] z-[4] px-6 text-center opacity-0">
          <span className="mb-4 inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">India's home for Insta brands</span>
          <p className="mx-auto mb-7 max-w-md text-lg text-muted-foreground">
            Real checkout, real sellers — shop your favourite Instagram brands in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#instagram" className="shimmer rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]">Explore Shops</a>
            <SellerDialog>
              <button className="group inline-flex items-center gap-1 rounded-full border-2 border-foreground px-6 py-3.5 font-semibold transition-colors hover:bg-foreground hover:text-background">
                Sell on Instashop
              </button>
            </SellerDialog>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Marquee() {
  const handles = shops.map((s) => `@${s.handle}`);
  const cats = categories.map((c) => c.name);
  const Row = ({ items, reverse }: { items: string[]; reverse?: boolean }) => (
    <div className="pause-hover flex overflow-hidden">
      <div className={cn("marquee-track flex shrink-0 gap-3 pr-3", reverse && "marquee-reverse")}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className={cn("whitespace-nowrap rounded-full px-5 py-2.5 font-display text-lg font-bold", reverse ? "bg-secondary text-secondary-foreground" : "bg-blush text-foreground")}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
  return (
    <section aria-label="Shops and categories" className="space-y-3 py-10">
      <Row items={handles} />
      <Row items={[...cats, ...cats]} reverse />
    </section>
  );
}

const spans = ["md:col-span-2 md:row-span-2", "", "", "md:row-span-2", "", "md:col-span-2", "", ""];

export function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-5 py-20">
      <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-5xl font-extrabold leading-none sm:text-7xl">
          Shop by <span className="font-serif font-medium italic text-primary">mood</span>
        </h2>
        <p className="max-w-xs text-muted-foreground">Eight aisles, thousands of tiny brands, zero boring basics.</p>
      </Reveal>
      <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.05} className={cn("h-full", spans[i], c.name === "Accessories" && "hidden md:block")}>
            <Tilt max={6} className="group relative h-full overflow-hidden rounded-[1.75rem] bg-blush">
              <img src={c.image} alt={c.name} loading="lazy" width={768} height={960} className="absolute -right-6 top-4 h-[115%] w-3/4 rotate-6 rounded-3xl object-cover shadow-card transition-transform duration-700 group-hover:rotate-0 group-hover:scale-105" />
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "radial-gradient(240px circle at var(--mx) var(--my), color-mix(in oklab, var(--rose) 35%, transparent), transparent 70%)" }} />
              <div className="relative flex h-full flex-col justify-between p-5">
                <span className="w-fit rounded-full bg-card px-3 py-1 text-xs font-bold">{c.count}+</span>
                <h3 className="text-2xl font-extrabold md:text-3xl">{c.name}</h3>
              </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
