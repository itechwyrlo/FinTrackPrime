// ============================================================
// Cart store — state, business logic, and LocalStorage persistence.
//
// This module owns the cart; nothing else mutates it. Components
// subscribe() to be told when the cart changes, so the store never
// needs to import UI code — dependencies only point one way
// (components → store), which is what keeps the module graph
// free of circular imports.
//
// Every mutation funnels through commit(): persist, then notify.
// Subscribers receive a small event object ({ type, id }) so they
// can react differently to an add vs. a remove vs. a clear.
// ============================================================

import { findProduct } from "../data/products.js";

/* ---------- Persistence ---------- */

const CART_STORAGE_KEY = "fintrack-prime-cart";

// LocalStorage can be unavailable (private browsing, storage disabled) or
// full — persistence failing must never break the in-memory cart, so both
// operations swallow storage errors deliberately.
const saveCart = () => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Cart keeps working for this visit; it just won't survive a refresh.
  }
};

// Stored data is untrusted input: it may be missing, corrupted, or refer
// to products that no longer exist in the catalog. Validate every item
// instead of assuming our own past writes are well-formed.
const loadCart = () => {
  try {
    const storedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) ?? [];
    if (!Array.isArray(storedCart)) return [];

    return storedCart.filter(
      (item) =>
        findProduct(item?.id) &&
        Number.isInteger(item?.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
};

/* ---------- State ---------- */

// The cart stores only { id, quantity }. Titles and prices are always
// looked up in the catalog — one source of truth, so a price change in
// products.js can never disagree with what the cart charges.
let cart = [];

const listeners = new Set();

export const subscribe = (listener) => {
  listeners.add(listener);
};

// Single choke point after every cart mutation: persist, then notify
// every subscribed component so it can re-render from the new state.
const commit = (event) => {
  saveCart();
  listeners.forEach((listener) => listener(event));
};

/* ---------- Reads ---------- */

// Treat the returned array as read-only — mutations go through the
// functions below so persistence and notifications can't be skipped.
export const getItems = () => cart;

export const getItemCount = () =>
  cart.reduce((total, item) => total + item.quantity, 0);

export const getSubtotal = () =>
  cart.reduce(
    (total, item) => total + item.quantity * findProduct(item.id).price,
    0,
  );

/* ---------- Mutations ---------- */

export const addToCart = (productId) => {
  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }
  commit({ type: "add", id: productId });
};

export const removeFromCart = (productId) => {
  cart = cart.filter((item) => item.id !== productId);
  commit({ type: "remove", id: productId });
};

export const changeQuantity = (productId, delta) => {
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  commit({ type: "quantity", id: productId });
};

// Used after a successful payment empties the purchase.
export const clearCart = () => {
  cart = [];
  commit({ type: "clear" });
};

/* ---------- Init ---------- */

// Restore the persisted cart before components do their first render.
// No commit() here — re-saving what we just loaded would be pointless
// (and would resurrect a just-expired cart if we ever add expiry), and
// no subscribers exist yet anyway.
export const initCart = () => {
  cart = loadCart();
};
