import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnnouncementBar, Categories, Hero, Marquee, Navbar } from "@/components/home/Top";
import { InstagramShops } from "@/components/home/Shops";
import { HowItWorks, Spotlight, Trending } from "@/components/home/Middle";
import { CounterPicks } from "@/components/home/Counter";
import { Footer, Reviews, SellerCTA } from "@/components/home/Bottom";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Instashop — Your favourite Instagram shops, one place" },
      { name: "description", content: "Discover and shop small Indian Instagram brands across fashion, beauty, jewellery and more. Sellers list free." },
      { property: "og:title", content: "Instashop — Your favourite Instagram shops, one place" },
      { property: "og:description", content: "Discover and shop small Indian Instagram brands. Sellers list free." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  return (
    <main className="overflow-x-clip">
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <Marquee />
      <Categories />
      <InstagramShops />
      <Trending />
      <CounterPicks />
      <Spotlight />
      <HowItWorks />
      <SellerCTA />
      <Reviews />
      <Footer />
    </main>
  );
}
