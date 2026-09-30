import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) ?? "";
  // Simulated network/database latency.
  await new Promise((r) => setTimeout(r, 350));
  const results = searchProducts(q);
  return NextResponse.json({ query: q, count: results.length, results });
}
