// ============================================================
// PayPal checkout component (Sandbox) — renders the PayPal
// buttons, handles payment outcomes, and owns the
// #checkout-message area (alerts + order success panel).
// ============================================================

import { findProduct } from "../../data/products.js";
import {
  getItems,
  getSubtotal,
  clearCart,
  subscribe,
} from "../../cart/cartStore.js";
import { announce } from "../cart-panel/cartPanel.js";
import { createOrderSuccessHTML } from "./orderSuccess.js";

const checkoutMessage = document.querySelector("#checkout-message");

// PayPal's SDK renders its own iframe buttons; we render them once and
// keep them, because createOrder reads the live subtotal on every click.
let paypalButtonsRendered = false;

// Most recent completed purchase; survives only until the page reloads.
let lastOrder = null;

const showCheckoutMessage = (type, message) => {
  checkoutMessage.innerHTML = `
    <div class="alert alert-${type} mb-3" role="alert">${message}</div>
  `;
};

const clearCheckoutMessage = () => {
  checkoutMessage.innerHTML = "";
};

// Snapshot the purchase BEFORE emptying the cart — the success panel
// needs to know what was bought after clearCart().
const handlePaymentSuccess = (orderDetails) => {
  lastOrder = {
    orderId: orderDetails?.id ?? "",
    payerName: orderDetails?.payer?.name?.given_name ?? "",
    items: getItems().map(({ id }) => findProduct(id)),
  };

  clearCart();
  checkoutMessage.innerHTML = createOrderSuccessHTML(lastOrder);
  announce("Payment complete. Your downloads are ready.");
};

const renderPayPalButtons = () => {
  if (paypalButtonsRendered || getItems().length === 0) return;

  // SDK blocked or offline: the cart still works, checkout is just absent.
  if (!window.paypal) return;

  window.paypal
    .Buttons({
      // Runs on every click, so the order always carries the current total.
      createOrder: (data, actions) =>
        actions.order.create({
          purchase_units: [
            {
              description: "FinTrack Prime — financial planning templates",
              amount: {
                currency_code: "USD",
                value: getSubtotal().toFixed(2),
              },
            },
          ],
        }),
      onApprove: async (data, actions) => {
        try {
          const orderDetails = await actions.order.capture();
          handlePaymentSuccess(orderDetails);
        } catch {
          showCheckoutMessage(
            "danger",
            "Payment was approved but could not be captured. Please try again.",
          );
        }
      },
      onError: () => {
        showCheckoutMessage(
          "danger",
          "Payment could not be completed. You have not been charged — please try again.",
        );
      },
    })
    .render("#paypal-button-container");

  paypalButtonsRendered = true;
};

export const initCheckout = () => {
  subscribe((event) => {
    // A stale "payment complete" alert would mislead once new items
    // enter the cart.
    if (event.type === "add") clearCheckoutMessage();

    renderPayPalButtons(); // no-op until the cart first becomes non-empty
  });

  renderPayPalButtons(); // covers a persisted non-empty cart on page load
};
