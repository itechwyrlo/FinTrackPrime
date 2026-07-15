// ============================================================
// FinTrack Prime — application entry point.
//
// Deliberately thin: it imports the global stylesheet, restores
// persisted state, and boots each component. All behavior lives
// in the modules themselves:
//
//   data/products.js                     — catalog data (pure data)
//   utils/format.js                      — currency + HTML-escape helpers
//   cart/cartStore.js                    — cart state, logic, persistence
//   components/product-grid/             — catalog rendering + add-to-cart
//   components/cart-panel/               — offcanvas cart, badge, a11y status
//   components/checkout/                 — PayPal buttons + order delivery
//
// Components never call each other's render functions — they react
// to cartStore events, so boot order here is the only ordering that
// matters: state first, then UI.
// ============================================================

import "./styles.css";

import { initCart } from "./cart/cartStore.js";
import { initProductGrid } from "./components/product-grid/productGrid.js";
import { initCartPanel } from "./components/cart-panel/cartPanel.js";
import { initCheckout } from "./components/checkout/paypalCheckout.js";

// Restore the persisted cart before any component's first paint.
initCart();

initProductGrid();
initCartPanel();
initCheckout();
