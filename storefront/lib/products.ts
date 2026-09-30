export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  tags: string[];
  accent: string;
  /** Outbound retailer catalog URL (verified shopping domain). */
  buyUrl: string;
  retailer: string;
};

const q = (s: string) => encodeURIComponent(s);

export const PRODUCTS: Product[] = [
  {
    id: "sony-wh1000xm5",
    name: "WH-1000XM5 Wireless Headphones",
    brand: "Sony",
    category: "Audio",
    tagline: "Reference-grade noise cancelling.",
    description:
      "Eight microphones, dual processors and 30-hour battery life in a featherlight, brushed-matte shell.",
    price: 399.99,
    tags: ["headphones", "audio", "noise cancelling", "wireless", "bluetooth"],
    accent: "#8b9bb4",
    buyUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${q("Sony WH-1000XM5")}`,
    retailer: "Best Buy",
  },
  {
    id: "apple-watch-ultra",
    name: "Apple Watch Ultra 2",
    brand: "Apple",
    category: "Wearables",
    tagline: "Titanium. Built for the extreme.",
    description:
      "49mm aerospace-grade titanium case, precision dual-frequency GPS and an 86-hour low-power mode.",
    price: 799,
    tags: ["watch", "smartwatch", "wearable", "titanium", "fitness"],
    accent: "#c9a66b",
    buyUrl: "https://www.apple.com/shop/buy-watch/apple-watch-ultra",
    retailer: "Apple",
  },
  {
    id: "macbook-pro-14",
    name: 'MacBook Pro 14"',
    brand: "Apple",
    category: "Computers",
    tagline: "Pro performance, all-day endurance.",
    description:
      "Liquid Retina XDR display, Apple silicon and up to 24 hours of battery in a precision-milled aluminium body.",
    price: 1599,
    tags: ["laptop", "macbook", "computer", "pro", "apple silicon"],
    accent: "#9aa3b2",
    buyUrl: "https://www.apple.com/shop/buy-mac/macbook-pro/14-inch",
    retailer: "Apple",
  },
  {
    id: "sony-a7cii",
    name: "Alpha 7C II Mirrorless Camera",
    brand: "Sony",
    category: "Cameras",
    tagline: "Full-frame, pocket-sized.",
    description:
      "33MP full-frame sensor with real-time AI subject recognition in the most compact full-frame body yet.",
    price: 2199.99,
    tags: ["camera", "mirrorless", "photography", "full-frame", "video"],
    accent: "#7f8793",
    buyUrl: `https://www.bhphotovideo.com/c/search?q=${q("Sony Alpha 7C II")}`,
    retailer: "B&H Photo",
  },
  {
    id: "dji-mini-4-pro",
    name: "DJI Mini 4 Pro Drone",
    brand: "DJI",
    category: "Drones",
    tagline: "249g of omnidirectional vision.",
    description:
      "4K/60 HDR true-vertical shooting, omnidirectional obstacle sensing and 34-minute flight time.",
    price: 759,
    tags: ["drone", "camera", "aerial", "4k", "video"],
    accent: "#6f7d8c",
    buyUrl: `https://www.bhphotovideo.com/c/search?q=${q("DJI Mini 4 Pro")}`,
    retailer: "B&H Photo",
  },
  {
    id: "ps5-pro",
    name: "PlayStation 5 Pro Console",
    brand: "Sony",
    category: "Gaming",
    tagline: "Higher fidelity. Higher frame rates.",
    description:
      "Advanced ray tracing, a larger GPU and AI upscaling for the most detailed console gaming yet.",
    price: 699.99,
    tags: ["console", "gaming", "playstation", "ps5", "games"],
    accent: "#5b7bb0",
    buyUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${q("PlayStation 5 Pro")}`,
    retailer: "Best Buy",
  },
  {
    id: "keychron-q1",
    name: "Keychron Q1 Pro Mechanical Keyboard",
    brand: "Keychron",
    category: "Accessories",
    tagline: "CNC aluminium. Gasket-mounted.",
    description:
      "Wireless QMK/VIA keyboard with a full CNC-milled aluminium body and hot-swappable switches.",
    price: 199,
    tags: ["keyboard", "mechanical", "accessories", "desk", "wireless"],
    accent: "#b08d57",
    buyUrl: `https://www.amazon.com/s?k=${q("Keychron Q1 Pro")}`,
    retailer: "Amazon",
  },
  {
    id: "lg-c4-oled",
    name: 'LG C4 55" OLED evo TV',
    brand: "LG",
    category: "Displays",
    tagline: "Perfect black. Infinite contrast.",
    description:
      "Self-lit OLED pixels, 144Hz gaming and the α9 AI Processor Gen7 for cinematic picture quality.",
    price: 1296.99,
    tags: ["tv", "oled", "display", "screen", "4k", "home theatre"],
    accent: "#4f6a8f",
    buyUrl: `https://www.bestbuy.com/site/searchpage.jsp?st=${q("LG C4 OLED 55")}`,
    retailer: "Best Buy",
  },
];

export function searchProducts(query: string): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return PRODUCTS;
  return PRODUCTS.map((p) => {
    const hay = [p.name, p.brand, p.category, p.tagline, ...p.tags].join(" ").toLowerCase();
    const score = terms.reduce((s, t) => s + (hay.includes(t) ? (p.name.toLowerCase().includes(t) ? 3 : 1) : 0), 0);
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

export const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
