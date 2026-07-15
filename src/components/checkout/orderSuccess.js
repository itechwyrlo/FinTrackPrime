// ============================================================
// Order success — pure HTML templates for the post-purchase
// panel: confirmation alert + download links.
//
// Deliberately DOM-free (string in, string out): paypalCheckout.js
// owns the #checkout-message element and decides when this appears.
// ============================================================

import { escapeHTML } from "../../utils/format.js";

// Each product names its deliverable in its `file` field (see
// data/products.js); all deliverables live in public/downloads/,
// which Vite serves from the site root as downloads/.
const getDownloadUrl = (product) =>
  `downloads/${encodeURIComponent(product.file)}`;

const createDownloadRow = (product) => `
  <li class="d-flex justify-content-between align-items-center gap-2 py-1">
    <span class="small">${escapeHTML(product.title)}</span>
    <a class="btn btn-ft-outline btn-sm" href="${getDownloadUrl(product)}" download>
      Download
    </a>
  </li>
`;

export const createOrderSuccessHTML = ({ orderId, payerName, items }) => {
  const greeting = payerName
    ? `Thanks, ${escapeHTML(payerName)} — payment`
    : "Payment";

  return `
    <div class="alert alert-success mb-3" role="alert">
      <p class="fw-semibold mb-1">${greeting} complete.</p>
      <p class="small mb-0">Order ${escapeHTML(orderId)}</p>
    </div>
    <div class="border rounded p-3 mb-3 bg-white">
      <h3 class="h6 mb-2">Your downloads</h3>
      <ul class="list-unstyled mb-0">
        ${items.map(createDownloadRow).join("")}
      </ul>
    </div>
  `;
};
