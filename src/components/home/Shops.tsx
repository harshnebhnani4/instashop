import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Search } from "lucide-react";
import { categories, formatK, shops, type Shop } from "@/data/shops";
import { InstagramIcon, Reveal, Tilt } from "./primitives";
import { cn } from "@/lib/utils";

function FollowButton({ shop, large }: { shop: Shop; large?: boolean }) {
  const [burst, setBurst] = useState(0);
  return (
    <a
      href={shop.instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => setBurst((b) => b + 1)}
      className={cn("relative inline-flex items-center gap-1.5 rounded-full bg-primary font-semibold text-primary-foreground transition-transform hover:scale-105", large ? "px-5 py-2.5" : "px-4 py-2 text-sm")}
    >
      <InstagramIcon className="h-4 w-4" /> Follow
      <AnimatePresence>
        {burst > 0 && (
          <motion.span key={burst} className="pointer-events-none absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 text-primary"
                initial={{ x: 0, y: 0, scale: 0.4 }}
                animate={{ x: Math.cos((i / 6) * Math.PI * 2) * 40, y: Math.sin((i / 6) * Math.PI * 2) * 40 - 10, scale: 1 }}
                transition={{ duration: 0.7 }}
              >
                <Heart className="h-3.5 w-3.5 fill-current" />
              </motion.span>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}

function Avatar({ shop, size = "h-14 w-14" }: { shop: Shop; size?: string }) {
  return (
    <span className="bg-ring-grad inline-block rounded-full p-[3px]">
      <img src={shop.avatar} alt={`${shop.name} avatar`} loading="lazy" className={cn("rounded-full border-2 border-card object-cover", size)} />
    </span>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  return (
    <Tilt className="h-full rounded-[1.75rem] bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <Avatar shop={shop} />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold">{shop.name}</h3>
          <p className="truncate text-sm text-muted-foreground">@{shop.handle}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-blush px-2.5 py-1">{shop.category}</span>
        <span className="text-muted-foreground">{formatK(shop.followers)} followers</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {shop.products.map((p) => (
          <img key={p.id} src={p.image} alt={p.alt} loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <a href={`#shop-${shop.handle}`} className="text-sm font-semibold underline decoration-primary decoration-2 underline-offset-4">Visit Shop</a>
        <FollowButton shop={shop} />
      </div>
    </Tilt>
  );
}

type Sort = "Trending" | "New" | "Most followed";

export function InstagramShops() {
  const [cat, setCat] = useState<string>("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("Trending");
  const [showAll, setShowAll] = useState(false);
  useEffect(() => setShowAll(false), [cat, q, sort]);
  const list = useMemo(() => {
    let l = shops.filter((s) => (cat === "All" || s.category === cat) && s.handle.includes(q.toLowerCase().replace("@", "")));
    l = [...l].sort((a, b) =>
      sort === "Most followed" ? b.followers - a.followers : sort === "New" ? Number(!!b.isNew) - Number(!!a.isNew) : (b.trending ?? 0) - (a.trending ?? 0),
    );
    return l;
  }, [cat, q, sort]);
  const featured = [...shops].sort((a, b) => b.followers - a.followers).slice(0, 5);

  return (
    <section id="instagram" className="bg-blush/60 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <h2 className="max-w-4xl text-5xl font-extrabold leading-[0.95] sm:text-7xl">
            Shops you'll love, straight from <span className="font-serif font-medium italic text-primary">Instagram</span>
          </h2>
        </Reveal>

        <div className="-mx-5 mt-12 flex snap-x gap-5 overflow-x-auto px-5 pb-4">
          {featured.map((s) => (
            <div key={s.handle} className="bg-forest-grad relative min-w-[85%] snap-start overflow-hidden rounded-[2rem] p-6 text-forest-foreground sm:min-w-[460px]">
              <img src={s.products[0].image} alt={s.products[0].alt} loading="lazy" className="absolute -right-8 -top-6 h-56 w-44 rotate-12 rounded-3xl object-cover opacity-90" />
              <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold text-foreground">Featured</span>
              <div className="relative mt-24 flex items-center gap-3">
                <Avatar shop={s} size="h-16 w-16" />
                <div>
                  <h3 className="text-2xl font-extrabold">{s.name}</h3>
                  <p className="text-sm opacity-80">@{s.handle} · {formatK(s.followers)}</p>
                </div>
              </div>
              <div className="relative mt-5"><FollowButton shop={s} large /></div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {["All", ...categories.map((c) => c.name)].map((c) => (
              <button key={c} onClick={() => setCat(c)} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors", cat === c ? "bg-foreground text-background" : "bg-card hover:bg-amaranth/40")}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 rounded-full bg-card px-4 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search @handle" className="w-36 bg-transparent text-sm outline-none" aria-label="Search by handle" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="rounded-full bg-card px-4 py-2 text-sm font-semibold outline-none">
              <option>Trending</option><option>New</option><option>Most followed</option>
            </select>
          </div>
        </div>

        <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((s, i) => (
              <motion.div
                key={s.handle}
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.06 }}
                className={cn(i >= 4 && !showAll && "hidden sm:block")}
              >
                <ShopCard shop={s} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {!showAll && list.length > 4 && (
          <div className="mt-6 flex justify-center sm:hidden">
            <button onClick={() => setShowAll(true)} className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">Show more</button>
          </div>
        )}
        {list.length === 0 && <p className="mt-10 text-center text-muted-foreground">No shops match that yet.</p>}
      </div>
    </section>
  );
}
