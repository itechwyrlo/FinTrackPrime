// ============================================================
// Product grid component — renders the catalog and handles
// "Add to cart" clicks.
//
// Talks to the cart only through the store's public API; it never
// touches the cart panel directly. The panel finds out about the
// add through its own store subscription.
// ============================================================

import { products } from "../../data/products.js";
import { formatPrice, escapeHTML } from "../../utils/format.js";
import { addToCart } from "../../cart/cartStore.js";
import { createProductArtwork } from "./productArtwork.js";

const productGrid = document.querySelector("#product-grid");

const createProductCard = (product) => `
  <div class="col-12 col-sm-6 col-lg-4">
    <article class="card h-100 ft-card">
      ${createProductArtwork(product)}
      <div class="card-body d-flex flex-column">
        <p class="ft-eyebrow mb-1">${escapeHTML(product.category)}</p>
        <h3 class="h5 card-title mb-2">${escapeHTML(product.title)}</h3>
        <p class="card-text text-body-secondary small mb-0">${escapeHTML(product.description)}</p>
        <div class="d-flex justify-content-between align-items-center mt-auto pt-3">
          <span class="ft-price">${formatPrice(product.price)}</span>
          <button type="button" class="btn btn-ft-gold" data-product-id="${escapeHTML(product.id)}">
            Add to cart
          </button>
        </div>
      </div>
    </article>
  </div>
`;

const renderProducts = (items) => {
  productGrid.innerHTML = items.map(createProductCard).join("");
};

// Swap the clicked button to a brief "Added ✓" state. The revert timer id
// lives on the element itself, so rapid re-clicks reset the countdown
// instead of an old timer reverting the label mid-feedback.
const showAddedFeedback = (button) => {
  clearTimeout(Number(button.dataset.revertTimer));

  button.classList.remove("ft-btn-added");
  void button.offsetWidth; // restart the pop animation on rapid clicks
  button.classList.add("ft-btn-added");
  button.textContent = "Added ✓";

  button.dataset.revertTimer = setTimeout(() => {
    button.classList.remove("ft-btn-added");
    button.textContent = "Add to cart";
  }, 1400);
};

export const initProductGrid = () => {
  renderProducts(products);

  // One listener on the container instead of one per button: survives
  // every re-render and costs the same no matter how many products exist.
  productGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-product-id]");
    if (!addButton) return;

    addToCart(addButton.dataset.productId);
    showAddedFeedback(addButton);
  });
};
