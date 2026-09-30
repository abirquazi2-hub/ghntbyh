import type { Product } from "@/lib/products";

/** Abstract product tile: layered metallic gradients tinted by the product accent. */
export default function ProductVisual({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <div className={`relative overflow-hidden brushed ${className}`} style={{ ["--a" as string]: product.accent }}>
      <div className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--a) 55%, transparent), transparent 60%)" }} />
      <div className="absolute left-1/2 top-1/2 h-[58%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-[28%] rotate-12 shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)]"
        style={{ background: "linear-gradient(145deg, color-mix(in srgb, var(--a) 70%, white), color-mix(in srgb, var(--a) 30%, black) 60%, #0a0d13)" }} />
      <div className="absolute left-1/2 top-1/2 h-[58%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-[28%] rotate-12 ring-1 ring-white/20" />
      <span className="absolute bottom-3 left-4 text-[10px] tracking-[0.25em] uppercase text-white/50">{product.category}</span>
    </div>
  );
}
