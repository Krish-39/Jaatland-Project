import type { Metadata } from "next";
import {
  DemoNotice,
  LegalArticle,
  LegalSection,
} from "@/components/legal-content";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT_RATE } from "@/lib/shipping";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping & Payment",
  description: "Shipping costs, delivery area and payment for the Jaatland demo store.",
};

export default function ShippingPaymentPage() {
  return (
    <LegalArticle title="Shipping & Payment">
      <DemoNotice />

      <LegalSection heading="Delivery area">
        <p>Delivery is offered within Germany only.</p>
      </LegalSection>

      <LegalSection heading="Shipping costs">
        <ul>
          <li>
            Orders with a goods value below{" "}
            {formatCurrency(FREE_SHIPPING_THRESHOLD)}:{" "}
            {formatCurrency(SHIPPING_FLAT_RATE)} flat rate per order.
          </li>
          <li>
            Orders with a goods value of{" "}
            {formatCurrency(FREE_SHIPPING_THRESHOLD)} or more: free shipping.
          </li>
        </ul>
        <p>
          The shipping cost for your cart is shown in the cart and again on the
          checkout page before you place an order.
        </p>
      </LegalSection>

      <LegalSection heading="Delivery time">
        <p>
          Because this is a demonstration, orders are not dispatched. In a live
          shop the delivery time would be stated here and on each product page.
        </p>
      </LegalSection>

      <LegalSection heading="Prices">
        <p>
          All prices are total prices in euro and include statutory value added
          tax. Shipping costs are added as described above.
        </p>
      </LegalSection>

      <LegalSection heading="Payment">
        <p>
          Checkout is simulated. No payment method is charged and card details
          entered in the form are neither transmitted nor stored. Please do not
          enter real card details.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
