// ============================================================
// Cart panel component — the offcanvas item list, subtotal,
// navbar badge, and screen-reader announcements.
//
// Never mutated directly by other components: it re-renders in
// response to store events, so it stays correct no matter which
// component (grid, panel, checkout) changed the cart.
// ============================================================

import { findProduct } from "../../data/products.js";
import { formatPrice, escapeHTML } from "../../utils/format.js";
import {
  getItems,
  getItemCount,
  getSubtotal,
  removeFromCart,
  changeQuantity,
  subscribe,
} from "../../cart/cartStore.js";

const cartItemsList = document.querySelector("#cart-items");
const cartEmptyMessage = document.querySelector("#cart-empty");
const cartFooter = document.querySelector("#cart-footer");
const cartSubtotal = document.querySelector("#cart-subtotal");
const cartBadge = document.querySelector("#cart-badge");
const cartCount = document.querySelector("#cart-count");
const cartStatus = document.querySelector("#cart-status");

/* ---------- Rendering ---------- */

const createCartItem = ({ id, quantity }) => {
  const product = findProduct(id);
  const safeId = escapeHTML(id);
  const safeTitle = escapeHTML(product.title);

  return `
    <li class="list-group-item px-0 py-3">
      <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <h3 class="h6 mb-0">${safeTitle}</h3>
          <span class="small text-body-secondary">${formatPrice(product.price)} each</span>
        </div>
        <button type="button" class="btn btn-link btn-sm link-danger p-0"
                data-action="remove" data-id="${safeId}">Remove</button>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <div class="input-group input-group-sm ft-qty" role="group"
             aria-label="Quantity of ${safeTitle}">
          <button type="button" class="btn btn-outline-secondary"
                  data-action="decrease" data-id="${safeId}"
                  aria-label="Decrease quantity of ${safeTitle}">&minus;</button>
          <span class="input-group-text">${quantity}</span>
          <button type="button" class="btn btn-outline-secondary"
                  data-action="increase" data-id="${safeId}"
                  aria-label="Increase quantity of ${safeTitle}">+</button>
        </div>
        <strong class="ft-price">${formatPrice(product.price * quantity)}</strong>
      </div>
    </li>
  `;
};

const renderCart = () => {
  const items = getItems();
  const isEmpty = items.length === 0;

  cartEmptyMessage.classList.toggle("d-none", !isEmpty);
  cartFooter.classList.toggle("d-none", isEmpty);
  cartItemsList.innerHTML = items.map(createCartItem).join("");
  cartSubtotal.textContent = formatPrice(getSubtotal());
};

const updateCartBadge = () => {
  cartCount.textContent = getItemCount();
};

/* ---------- Feedback ---------- */

// Announce cart changes to screen readers via the visually-hidden
// role="status" live region.
export const announce = (message) => {
  cartStatus.textContent = message;
};

const pulseBadge = () => {
  cartBadge.classList.remove("ft-badge-pulse");
  void cartBadge.offsetWidth; // reflow restarts the animation on rapid clicks
  cartBadge.classList.add("ft-badge-pulse");
};

/* ---------- Init ---------- */

export const initCartPanel = () => {
  // One listener on the list instead of one per row button: survives
  // every re-render (event delegation).
  cartItemsList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const { action, id } = actionButton.dataset;
    if (action === "increase") changeQuantity(id, 1);
    if (action === "decrease") changeQuantity(id, -1);
    if (action === "remove") removeFromCart(id);
  });

  subscribe((event) => {
    renderCart();
    updateCartBadge();

    // Removed items are gone from the cart but still in the catalog,
    // so the title lookup for the announcement always succeeds.
    if (event.type === "add") {
      announce(`${findProduct(event.id).title} added to cart`);
      pulseBadge();
    }
    if (event.type === "remove") {
      announce(`${findProduct(event.id).title} removed from cart`);
    }
  });

  // First paint from the persisted cart restored in initCart().
  renderCart();
  updateCartBadge();
};
