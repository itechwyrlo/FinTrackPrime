// ============================================================
// Product artwork — the branded product photo on each catalog card.
//
// `product.image` is a bundled asset URL (imported in data/products.js),
// so the src needs no escaping. The 4:3 ratio box matches the source
// PNGs; object-fit in .ft-thumb-img absorbs any rounding mismatch.
//
// Pure string-building: no DOM access, no state — which is why it
// can live in its own file with zero imports from the rest of the app.
// ============================================================

// Decorative only (aria-hidden) — the product name follows in the card body.
export const createProductArtwork = (product) => `
  <div class="ratio ratio-4x3 ft-thumb" aria-hidden="true">
    <img src="${product.image}" alt="" class="ft-thumb-img" loading="lazy">
  </div>
`;
