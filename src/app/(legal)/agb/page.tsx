import type { Metadata } from "next";
import Link from "next/link";
import {
  DemoNotice,
  LegalArticle,
  LegalSection,
  OperatorAddress,
} from "@/components/legal-content";

export const metadata: Metadata = {
  title: "Terms and Conditions (AGB)",
  description: "Terms and conditions of the Jaatland demo store.",
};

export default function TermsPage() {
  return (
    <LegalArticle title="Terms and Conditions (AGB)">
      <DemoNotice />

      <LegalSection heading="1. Scope and provider">
        <p>
          These terms apply to the use of this website. The provider is:
        </p>
        <OperatorAddress />
      </LegalSection>

      <LegalSection heading="2. Demonstration only: no contract">
        <p>
          This website demonstrates how an online shop works. The products
          shown are examples and are not offered for sale. Completing the
          checkout does not constitute a binding offer or an acceptance, no
          purchase contract is concluded, no payment is collected and no goods
          are delivered. The order confirmation shown after checkout is part of
          the demonstration.
        </p>
        <p>
          Sections 3 to 8 describe the terms that would apply to purchases in a
          live shop. They are shown so the demonstration is complete.
        </p>
      </LegalSection>

      <LegalSection heading="3. Conclusion of contract">
        <p>
          The presentation of products in the shop is not a legally binding
          offer but an invitation to order. By clicking &quot;Order with
          obligation to pay&quot; you place a binding order for the goods in
          your cart. You can review and correct your entries at any time before
          placing the order. The contract is concluded when we accept your
          order by sending an order confirmation or by dispatching the goods.
          The contract language is English. We store the contract text and you
          can view your orders in your account.
        </p>
      </LegalSection>

      <LegalSection heading="4. Prices and shipping costs">
        <p>
          All prices are total prices in euro including statutory value added
          tax. Shipping costs are charged in addition and are shown in the cart
          and at checkout before you order. Details:{" "}
          <Link href="/versand-zahlung">Shipping &amp; Payment</Link>.
        </p>
      </LegalSection>

      <LegalSection heading="5. Delivery">
        <p>
          Delivery is made within Germany to the delivery address you provide.
        </p>
      </LegalSection>

      <LegalSection heading="6. Payment and retention of title">
        <p>
          The payment methods available are shown at checkout. The goods remain
          our property until they have been paid for in full.
        </p>
      </LegalSection>

      <LegalSection heading="7. Right of withdrawal">
        <p>
          Consumers have a statutory right of withdrawal of 14 days. Details
          and the model withdrawal form are set out on the{" "}
          <Link href="/widerruf">Right of Withdrawal</Link> page.
        </p>
      </LegalSection>

      <LegalSection heading="8. Warranty">
        <p>
          The statutory warranty rights for defects apply.
        </p>
      </LegalSection>

      <LegalSection heading="9. Dispute resolution">
        <p>
          We are neither willing nor obliged to take part in dispute resolution
          proceedings before a consumer arbitration board (§ 36 VSBG).
        </p>
      </LegalSection>

      <LegalSection heading="10. Applicable law">
        <p>
          German law applies, excluding the UN Convention on Contracts for the
          International Sale of Goods. If you are a consumer habitually
          resident in another EU member state, the mandatory consumer
          protection provisions of that state remain unaffected.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
