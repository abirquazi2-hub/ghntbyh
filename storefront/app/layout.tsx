import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "AETHER — Precision technology, curated",
  description: "A curated storefront for the world's most desirable technology, presented in immersive 3D.",
};
export const viewport: Viewport = { themeColor: "#020308", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
