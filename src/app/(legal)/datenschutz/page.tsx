import type { Metadata } from "next";
import {
  DemoNotice,
  LegalArticle,
  LegalSection,
  OperatorAddress,
} from "@/components/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the Jaatland demo store handles personal data.",
};

// Keep this page in step with the code. It describes what the site does
// today: when a later release adds a database, accounts, payments or email,
// the matching sections (recipients, purposes, retention) must be added in
// the same change.
export default function PrivacyPolicyPage() {
  return (
    <LegalArticle title="Privacy Policy">
      <DemoNotice />

      <LegalSection heading="1. Controller">
        <p>
          The controller within the meaning of the General Data Protection
          Regulation (GDPR) is:
        </p>
        <OperatorAddress />
      </LegalSection>

      <LegalSection heading="2. Summary">
        <ul>
          <li>This site uses no analytics, advertising or tracking tools.</li>
          <li>
            The only cookie is a login cookie, set when you sign in to an
            account.
          </li>
          <li>
            If you create an account, we store your email address and a
            protected (hashed) form of your password.
          </li>
          <li>
            Your cart, wishlist, demo orders and display preferences are stored
            only in your own browser and are not transmitted to us.
          </li>
          <li>
            Our hosting provider processes technical connection data (such as
            your IP address) to deliver the site.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Hosting and server log files">
        <p>
          This site is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina,
          CA 91723, USA. When you open a page, Vercel processes the data your
          browser sends automatically: IP address, date and time of the
          request, the page requested, the referring page, browser type and
          operating system.
        </p>
        <p>
          This processing is necessary to deliver the site and to keep it
          secure and stable. The legal basis is our legitimate interest in a
          reliable and secure website (Art. 6 (1) (f) GDPR). Vercel acts as our
          processor under a data processing agreement. Data may be processed in
          the USA; transfers are covered by the EU-U.S. Data Privacy Framework
          and, where applicable, the EU Standard Contractual Clauses. Log data
          is retained by the hosting provider for a limited period and then
          deleted.
        </p>
      </LegalSection>

      <LegalSection heading="4. Customer account">
        <p>
          You can browse and use the demo checkout without an account. If you
          create one, we process:
        </p>
        <ul>
          <li>your email address,</li>
          <li>
            your password, stored only as a salted hash (scrypt) from which the
            password cannot be read,
          </li>
          <li>the date the account was created, and</li>
          <li>your active login sessions (creation and expiry time).</li>
        </ul>
        <p>
          The legal basis is the performance of the user agreement you enter
          into by registering (Art. 6 (1) (b) GDPR). We keep this data until
          you delete your account. You can download your data and delete your
          account at any time on the &quot;Your account&quot; page; deleting
          the account erases it and all of its sessions immediately.
        </p>
        <p>
          Account data is stored in a PostgreSQL database operated for us by
          Neon (Neon, Inc., USA) as our processor
          under a data processing agreement. Where data is processed outside
          the EU, the transfer is covered by the EU-U.S. Data Privacy Framework
          and, where applicable, the EU Standard Contractual Clauses.
        </p>
        <p>
          To protect accounts against password guessing, the number of login
          and registration attempts per IP address and per account is limited
          for a short time (Art. 6 (1) (f) GDPR). These counters are held in
          memory only and are not stored permanently.
        </p>
      </LegalSection>

      <LegalSection heading="5. Cookies">
        <p>
          When you sign in, we set one cookie that contains a random session
          identifier. It keeps you signed in for up to 30 days, or until you
          sign out, and cannot be read by scripts. It is strictly necessary to
          provide the login you requested, so no consent is required (§ 25 (2)
          no. 2 TDDDG). We set no other cookies.
        </p>
      </LegalSection>

      <LegalSection heading="6. Data stored in your browser (local storage)">
        <p>
          The site stores the following information in your browser&apos;s
          local storage so the functions you use keep working. It stays on your
          device and is not sent to our servers.
        </p>
        <ul>
          <li>Cart contents and wishlist</li>
          <li>Display preferences: light or dark theme, sort order, price filter</li>
          <li>
            Demo orders: the name, email address, delivery address and items
            you enter at checkout
          </li>
          <li>The email address you enter in the newsletter field</li>
        </ul>
        <p>
          Storing this information is strictly necessary to provide functions
          you have expressly requested, so no consent is required (§ 25 (2)
          no. 2 TDDDG). You can delete it at any time by clearing the site data
          for this website in your browser settings.
        </p>
      </LegalSection>

      <LegalSection heading="7. Checkout and payment">
        <p>
          Checkout is simulated. The card details you type into the checkout
          form are not transmitted and not stored. No payment provider receives
          any data from this site.
        </p>
      </LegalSection>

      <LegalSection heading="8. Newsletter">
        <p>
          The newsletter field is part of the demonstration. The address you
          enter is saved only in your browser. We do not receive it and send no
          emails.
        </p>
      </LegalSection>

      <LegalSection heading="9. Fonts and images">
        <p>
          Fonts and product images are served from this website itself. Your
          browser does not contact font or image servers of third parties when
          you browse the shop.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contacting us">
        <p>
          If you email us, we process your message and contact details to deal
          with your request (Art. 6 (1) (f) GDPR, or Art. 6 (1) (b) GDPR where
          your request relates to a contract). We delete the correspondence
          once it is no longer needed, unless statutory retention duties apply.
        </p>
      </LegalSection>

      <LegalSection heading="11. Your rights">
        <p>Under the GDPR you have the right to:</p>
        <ul>
          <li>access the personal data we hold about you (Art. 15)</li>
          <li>have inaccurate data corrected (Art. 16)</li>
          <li>have your data erased (Art. 17)</li>
          <li>have processing restricted (Art. 18)</li>
          <li>receive your data in a portable format (Art. 20)</li>
          <li>
            object to processing that is based on our legitimate interests
            (Art. 21)
          </li>
          <li>withdraw any consent you have given, with effect for the future (Art. 7 (3))</li>
        </ul>
        <p>
          You can use the access, portability and erasure rights for your
          account yourself on the &quot;Your account&quot; page. For anything
          else, contact us using the details above. You also have the right to lodge a complaint with a data protection
          supervisory authority, in particular in the EU member state where you
          live or work or where you believe an infringement took place (Art. 77
          GDPR).
        </p>
      </LegalSection>

      <LegalSection heading="12. Changes to this policy">
        <p>
          We update this policy whenever the site&apos;s data processing
          changes. The date at the top shows the current version.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
