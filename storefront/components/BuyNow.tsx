import type { Product } from "@/lib/products";
import { ArrowIcon } from "./Icons";

export default function BuyNow({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <a
      href={product.buyUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`Buy ${product.name} now at ${product.retailer} (opens in a new tab)`}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-b from-white to-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 active:scale-[.98] ${className}`}
    >
      Buy Now <span className="text-slate-600 font-normal">· {product.retailer}</span> <ArrowIcon />
    </a>
  );
}
