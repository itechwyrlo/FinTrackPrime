// ============================================================
// Formatting helpers — pure functions, no DOM, no state.
// Safe to import from anywhere without creating dependency cycles.
// ============================================================

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatPrice = (amount) => currencyFormatter.format(amount);

// Escape data-driven text before interpolating into HTML. Product data is
// first-party today, but rendering must stay safe if it ever comes from an
// API or CMS — output encoding is the habit, not trust in the source.
export const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
