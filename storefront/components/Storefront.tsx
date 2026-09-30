"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { PRODUCTS, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import SearchOverlay from "./SearchOverlay";
import CartDrawer from "./CartDrawer";
import { BagIcon, SearchIcon } from "./Icons";
import { HeroFallback } from "./HeroFallback";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false, loading: () => <HeroFallback /> });

export default function Storefront() {
  const { count, setOpen: setCartOpen } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState<Product | null>(null);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeModal = useCallback(() => setActive(null), []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="font-display text-xl font-extrabold tracking-[0.3em] metal-text">AETHER</a>
          <nav className="hidden gap-8 text-sm text-slate-400 md:flex">
            <a href="#collection" className="hover:text-white">Collection</a>
            <a href="#craft" className="hover:text-white">Craft</a>
            <a href="#trust" className="hover:text-white">Why AETHER</a>
          </nav>
          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(true)} aria-label="Search" className="rounded-full p-2.5 text-slate-300 hover:bg-white/10 hover:text-white"><SearchIcon /></button>
            <button onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`} className="relative rounded-full p-2.5 text-slate-300 hover:bg-white/10 hover:text-white">
              <BagIcon />
              {count > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-slate-950">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,#1a2233_0%,#05070b_60%)]" />
          <div className="absolute inset-0 -z-10 opacity-[.07] [background:repeating-linear-gradient(90deg,#fff_0_1px,transparent_1px_4px)]" />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-4 px-5 sm:px-8 lg:grid-cols-2">
            <div className="relative z-10 py-10 lg:py-0">
              <p className="animate-rise text-xs uppercase tracking-[0.4em] text-gold">The Spring Collection</p>
              <h1 className="animate-rise mt-5 inline-block pb-2 font-display text-[clamp(2.25rem,5vw,4.5rem)] font-extrabold leading-[0.95] metal-text [animation-delay:.1s]">
                Engineered<br />to be felt.
              </h1>
              <p className="animate-rise mt-6 max-w-md text-base text-slate-400 sm:text-lg [animation-delay:.2s]">
                A curated selection of the most considered technology on earth — inspect it in 3D, then buy it from the retailers you already trust.
              </p>
              <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:.3s]">
                <a href="#collection" className="rounded-full bg-gradient-to-b from-white to-slate-300 px-7 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">Shop the collection</a>
                <button onClick={() => setSearchOpen(true)} className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10">Search</button>
              </div>
            </div>
            <div className="relative h-[52vh] min-h-[320px] sm:h-[62vh] lg:h-[78vh]">
              <div className="absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(243,201,139,.16),transparent_65%)] blur-2xl" />
              <HeroScene />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020308] to-transparent" />
        </section>

        {/* COLLECTION */}
        <section id="collection" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-gold">Collection</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">Objects of desire</h2>
            </div>
            <p className="max-w-sm text-sm text-slate-500">Every “Buy Now” links straight to the retailer’s catalogue. Add items to your cart to plan your order.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} onOpen={setActive} />)}
          </div>
        </section>

        {/* CRAFT */}
        <section id="craft" className="border-y border-white/5 brushed">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-3">
            {[
              ["Precision", "Milled metals, reference-grade sensors, panels calibrated to the last nit."],
              ["Performance", "Silicon that disappears into the experience, so the work — or play — comes first."],
              ["Permanence", "Products chosen for repairability, software support and resale value."],
            ].map(([t, d]) => (
              <div key={t}><h3 className="font-display text-2xl font-bold metal-text">{t}</h3><p className="mt-3 text-slate-400">{d}</p></div>
            ))}
          </div>
        </section>

        <section id="trust" className="mx-auto max-w-7xl px-5 py-24 text-center sm:px-8">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Buy where you trust.</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">AETHER doesn’t hold inventory. We point you to established retailers — Apple, Best Buy, B&amp;H Photo and Amazon — for secure checkout, warranty and returns.</p>
        </section>
      </main>

      <footer className="border-t border-white/5 px-5 py-10 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} AETHER. Demo storefront. Product names and trademarks belong to their respective owners. Outbound links may be affiliate links.
      </footer>

      <SearchOverlay open={searchOpen} onClose={closeSearch} onOpenProduct={setActive} />
      <ProductModal product={active} onClose={closeModal} />
      <CartDrawer />
    </>
  );
}
