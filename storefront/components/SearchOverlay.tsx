"use client";

import { useEffect, useRef, useState } from "react";
import { fmt, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import BuyNow from "./BuyNow";
import ProductVisual from "./ProductVisual";
import { CloseIcon, SearchIcon } from "./Icons";

const SUGGESTIONS = ["headphones", "camera", "watch", "laptop", "gaming", "drone"];

export default function SearchOverlay({ open, onClose, onOpenProduct }: { open: boolean; onClose: () => void; onOpenProduct: (p: Product) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { add } = useCart();

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Debounced mock server fetch; stale responses are aborted.
  useEffect(() => {
    if (!q.trim()) { setResults(null); setLoading(false); setError(false); return; }
    setLoading(true);
    setError(false);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setResults(data.results);
        setLoading(false);
      } catch (e) {
        if ((e as Error).name !== "AbortError") { setError(true); setLoading(false); }
      }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Search products" className="fixed inset-0 z-[65] animate-fadein">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative mx-auto flex h-full max-w-3xl flex-col px-4 pt-6 sm:pt-16">
        <div className="flex items-center gap-3 rounded-2xl bg-steel px-5 py-4 hairline">
          <span className="text-slate-400"><SearchIcon /></span>
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search headphones, cameras, laptops…" aria-label="Search products" className="w-full bg-transparent text-lg text-white outline-none placeholder:text-slate-600" />
          <button onClick={onClose} aria-label="Close search" className="rounded-full p-1 text-slate-400 hover:text-white"><CloseIcon /></button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto pb-10" aria-live="polite">
          {results === null && !loading && (
            <div className="px-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Trending</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setQ(s)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/10">{s}</button>
                ))}
              </div>
            </div>
          )}
          {loading && <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}</div>}
          {error && <p className="text-sm text-red-300">Search failed. Please try again.</p>}
          {!loading && results?.length === 0 && <p className="px-1 text-slate-400">No results for “{q}”. Try “camera” or “headphones”.</p>}
          {!loading && results && results.length > 0 && (
            <ul className="space-y-3">
              <li className="px-1 text-xs text-slate-500">{results.length} result{results.length > 1 ? "s" : ""}</li>
              {results.map((p) => (
                <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-steel p-3 hairline">
                  <button onClick={() => { onClose(); onOpenProduct(p); }} className="shrink-0" aria-label={`Details for ${p.name}`}>
                    <ProductVisual product={p} className="h-20 w-24 rounded-xl sm:h-24 sm:w-32" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{p.brand}</p>
                    <p className="truncate font-medium text-white">{p.name}</p>
                    <p className="text-sm text-slate-400">{fmt(p.price)}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => add(p)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/10">Add</button>
                    <BuyNow product={p} className="!px-4 !py-2 [&>span]:hidden" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
