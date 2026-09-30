"use client";

import { useEffect } from "react";
import { fmt } from "@/lib/products";
import { FREE_SHIPPING, useCart } from "@/lib/cart";
import BuyNow from "./BuyNow";
import { CloseIcon, MinusIcon, PlusIcon } from "./Icons";

export default function CartDrawer() {
  const { open, setOpen, lines, count, subtotal, shipping, tax, total, setQty, remove, clear } = useCart();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const progress = Math.min(1, subtotal / FREE_SHIPPING);

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside role="dialog" aria-label="Shopping cart" className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-steel hairline shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}>
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 className="font-display text-xl font-bold text-white">Your Cart <span className="text-slate-500">({count})</span></h2>
          <button onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-full p-2 text-slate-300 hover:bg-white/10"><CloseIcon /></button>
        </header>

        {lines.length === 0 ? (
          <div className="grid flex-1 place-items-center px-8 text-center text-slate-400">
            <div><p className="font-display text-lg text-white">Your cart is empty</p><p className="mt-1 text-sm">Add something extraordinary.</p></div>
          </div>
        ) : (
          <>
            <div className="border-b border-white/10 px-6 py-4 text-xs text-slate-400">
              {subtotal >= FREE_SHIPPING ? "You've unlocked free shipping." : `Add ${fmt(FREE_SHIPPING - subtotal)} more for free shipping.`}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-slate-300 to-gold transition-all duration-500" style={{ width: `${progress * 100}%` }} /></div>
            </div>
            <ul className="flex-1 divide-y divide-white/5 overflow-y-auto px-6">
              {lines.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-4 py-5">
                  <div className="h-20 w-20 shrink-0 rounded-xl brushed hairline" style={{ background: `radial-gradient(circle at 30% 25%, ${product.accent}, #0b0f17 75%)` }} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-slate-500">{fmt(product.price)} each</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-white/15">
                        <button onClick={() => setQty(product.id, qty - 1)} aria-label={`Decrease quantity of ${product.name}`} className="p-2 hover:text-white text-slate-400"><MinusIcon /></button>
                        <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)} aria-label={`Increase quantity of ${product.name}`} className="p-2 hover:text-white text-slate-400"><PlusIcon /></button>
                      </div>
                      <p className="font-semibold tabular-nums text-white">{fmt(product.price * qty)}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <button onClick={() => remove(product.id)} className="text-slate-500 underline-offset-2 hover:text-white hover:underline">Remove</button>
                      <BuyNow product={product} className="!bg-none !bg-transparent !p-0 !text-xs !font-medium !text-gold hover:underline [&>span]:hidden" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="space-y-2 border-t border-white/10 bg-black/30 px-6 py-5 text-sm">
              <Row label="Subtotal" value={fmt(subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? "Free" : fmt(shipping)} />
              <Row label="Estimated tax (8%)" value={fmt(tax)} />
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <span className="font-medium text-white">Total</span>
                <span className="font-display text-2xl font-bold text-white tabular-nums">{fmt(total)}</span>
              </div>
              <button
                onClick={() => { alert("Demo checkout: this storefront doesn't process payments. Use each item's Buy Now link to purchase from the retailer."); }}
                className="mt-2 w-full rounded-full bg-gradient-to-b from-white to-slate-300 py-3 font-semibold text-slate-950 transition hover:brightness-110 active:scale-[.99]"
              >
                Checkout
              </button>
              <button onClick={clear} className="w-full py-1 text-xs text-slate-500 hover:text-white">Clear cart</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-slate-400"><span>{label}</span><span className="tabular-nums text-slate-200">{value}</span></div>;
}
