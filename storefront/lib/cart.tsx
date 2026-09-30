"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import type { Product } from "./products";

type Line = { product: Product; qty: number };
type State = Record<string, Line>;
type Action =
  | { type: "add"; product: Product }
  | { type: "set"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "hydrate"; state: State };

const MAX_QTY = 10;

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case "add": {
      const cur = state[a.product.id];
      return { ...state, [a.product.id]: { product: a.product, qty: Math.min(MAX_QTY, (cur?.qty ?? 0) + 1) } };
    }
    case "set": {
      const cur = state[a.id];
      if (!cur) return state;
      if (a.qty <= 0) {
        const { [a.id]: _, ...rest } = state;
        return rest;
      }
      return { ...state, [a.id]: { ...cur, qty: Math.min(MAX_QTY, a.qty) } };
    }
    case "remove": {
      const { [a.id]: _, ...rest } = state;
      return rest;
    }
    case "clear":
      return {};
    case "hydrate":
      return a.state;
  }
}

type CartCtx = {
  lines: Line[];
  count: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "cc-cart-v1";
const FREE_SHIPPING = 500;
const TAX_RATE = 0.08;

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {});
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const add = useCallback((product: Product) => {
    dispatch({ type: "add", product });
    setOpen(true);
  }, []);
  const setQty = useCallback((id: string, qty: number) => dispatch({ type: "set", id, qty }), []);
  const remove = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartCtx>(() => {
    const lines = Object.values(state);
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : 14.99;
    const tax = subtotal * TAX_RATE;
    return { lines, count, subtotal, shipping, tax, total: subtotal + shipping + tax, open, setOpen, add, setQty, remove, clear };
  }, [state, open, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}

export { FREE_SHIPPING };
