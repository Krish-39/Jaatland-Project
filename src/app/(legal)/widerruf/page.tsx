import type { Metadata } from "next";
import {
  DemoNotice,
  LegalArticle,
  LegalSection,
  OperatorAddress,
} from "@/components/legal-content";

export const metadata: Metadata = {
  title: "Right of Withdrawal",
  description: "Withdrawal policy and model withdrawal form of the Jaatland demo store.",
};

export default function WithdrawalPage() {
  return (
    <LegalArticle title="Right of Withdrawal">
      <DemoNotice />

      <LegalSection heading="Withdrawal policy">
        <p>
          Consumers have a right of withdrawal as set out below. A consumer is
          any natural person who enters into a legal transaction for purposes
          that are predominantly outside their trade, business or profession.
        </p>
      </LegalSection>

      <LegalSection heading="Right of withdrawal">
        <p>
          You have the right to withdraw from this contract within fourteen
          days without giving any reason.
        </p>
        <p>
          The withdrawal period is fourteen days from the day on which you, or
          a third party named by you who is not the carrier, took possession of
          the goods. If you ordered several goods in one order and they are
          delivered separately, the period runs from the day the last item was
          received.
        </p>
        <p>
          To exercise your right of withdrawal, you must inform us of your
          decision to withdraw from this contract by a clear statement (for
          example a letter sent by post or an email). Our contact details:
        </p>
        <OperatorAddress />
        <p>
          You may use the model withdrawal form below, but it is not
          obligatory. To meet the withdrawal deadline, it is sufficient that
          you send your notice of withdrawal before the withdrawal period has
          expired.
        </p>
      </LegalSection>

      <LegalSection heading="Effects of withdrawal">
        <p>
          If you withdraw from this contract, we will reimburse all payments we
          have received from you, including delivery costs (except any
          additional costs resulting from your choice of a type of delivery
          other than the least expensive standard delivery offered by us),
          without undue delay and no later than fourteen days from the day on
          which we received your notice of withdrawal. We will use the same
          means of payment you used for the original transaction unless
          expressly agreed otherwise with you; you will not be charged any fees
          for this reimbursement. We may withhold reimbursement until we have
          received the goods back or you have supplied proof of having sent
          them back, whichever is earlier.
        </p>
        <p>
          You must send back or hand over the goods to us without undue delay
          and in any event no later than fourteen days from the day on which
          you informed us of your withdrawal. The deadline is met if you send
          the goods before the fourteen days have expired. You bear the direct
          cost of returning the goods.
        </p>
        <p>
          You are only liable for any loss in value of the goods resulting from
          handling them in a way that was not necessary to establish their
          nature, characteristics and functioning.
        </p>
      </LegalSection>

      <LegalSection heading="Model withdrawal form">
        <p>
          If you want to withdraw from the contract, please complete this form
          and send it back to us at the address above.
        </p>
        <div className="rounded-lg border p-4">
          <p>
            I/We (*) hereby give notice that I/we (*) withdraw from my/our (*)
            contract for the purchase of the following goods:
          </p>
          <p className="mt-3">Ordered on (*) / received on (*):</p>
          <p>Name of consumer(s):</p>
          <p>Address of consumer(s):</p>
          <p>Signature of consumer(s) (only if this form is sent on paper):</p>
          <p>Date:</p>
          <p className="mt-3 text-sm">(*) Delete as appropriate.</p>
        </div>
      </LegalSection>
    </LegalArticle>
  );
}
