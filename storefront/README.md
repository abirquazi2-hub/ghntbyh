# AETHER storefront

Next.js 15 · React 19 · TypeScript · Tailwind CSS 4 · Three.js / React Three Fiber.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Hero 3D (Option A)
Drop your model at `public/assets/product.glb`. It is auto-centred and scaled to fit.
Until it exists, a procedural product is rendered. If WebGL is unavailable or the context
is lost, the hero switches to a CSS fallback (`components/HeroFallback.tsx`).
Idle float/breathing + slow Y orbit; on desktop the mesh shrinks, tilts and tracks the
cursor with frame-rate-independent lerp damping (`components/HeroScene.tsx`).

## Search, Buy Now, Cart
- `app/api/search/route.ts` – mock server search (350 ms simulated latency).
- `lib/products.ts` – catalogue; each product's `buyUrl` points to a retailer catalogue page
  (Apple, Best Buy, B&H, Amazon). Edit these to your own verified/affiliate URLs.
- `lib/cart.tsx` – Context + reducer cart (qty, subtotal, shipping, tax, total; persisted to localStorage).
- Checkout is a demo stub: no payments are processed.
