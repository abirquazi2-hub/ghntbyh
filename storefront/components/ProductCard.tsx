"use client";

import { fmt, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import ProductVisual from "./ProductVisual";
import BuyNow from "./BuyNow";

export default function ProductCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const { add } = useCart();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-steel hairline transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_-30px_rgba(243,201,139,.25)]">
      <button onClick={() => onOpen(product)} className="text-left" aria-label={`View details for ${product.name}`}>
        <ProductVisual product={product} className="aspect-[4/3] transition duration-700 group-hover:scale-[1.03]" />
      </button>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{product.brand}</p>
          <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-white">{product.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{product.tagline}</p>
        </div>
        <p className="mt-auto text-xl font-semibold text-white">{fmt(product.price)}</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => add(product)} className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 active:scale-[.98]">
            Add to Cart
          </button>
          <BuyNow product={product} className="!px-3 [&>span]:hidden sm:[&>span]:inline" />
        </div>
      </div>
    </article>
  );
}
