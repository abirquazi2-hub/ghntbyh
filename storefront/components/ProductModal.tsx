"use client";

import { useEffect, useRef } from "react";
import { fmt, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ProductVisual from "./ProductVisual";
import BuyNow from "./BuyNow";
import { CloseIcon } from "./Icons";

export default function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { add } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!product) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  if (!product) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={product.name} className="fixed inset-0 z-[60] grid place-items-center p-4 animate-fadein">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative grid max-h-[92vh] w-full max-w-4xl overflow-auto rounded-3xl bg-steel hairline md:grid-cols-2 animate-rise">
        <button ref={closeRef} onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/80"><CloseIcon /></button>
        <ProductVisual product={product} className="min-h-64 md:min-h-full" />
        <div className="flex flex-col gap-4 p-7 sm:p-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">{product.brand} · {product.category}</p>
          <h2 className="font-display text-3xl font-bold leading-tight text-white">{product.name}</h2>
          <p className="text-slate-400">{product.description}</p>
          <p className="text-3xl font-semibold text-white">{fmt(product.price)}</p>
          <div className="mt-auto flex flex-col gap-3 pt-4 sm:flex-row">
            <button onClick={() => { add(product); onClose(); }} className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10">Add to Cart</button>
            <BuyNow product={product} />
          </div>
          <p className="text-xs text-slate-500">Buy Now opens the product at {product.retailer} in a new tab. Prices and availability are set by the retailer.</p>
        </div>
      </div>
    </div>
  );
}
