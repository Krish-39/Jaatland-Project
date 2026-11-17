import type { Metadata } from "next";
import {
  DemoNotice,
  LegalArticle,
  LegalSection,
  OperatorAddress,
} from "@/components/legal-content";
import { OPERATOR } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Legal Notice (Impressum)",
  description: "Provider identification for the Jaatland demo store.",
};

export default function ImpressumPage() {
  return (
    <LegalArticle title="Legal Notice (Impressum)">
      <DemoNotice />

      <LegalSection heading="Information pursuant to § 5 DDG">
        <OperatorAddress />
      </LegalSection>

      {OPERATOR.vatId && (
        <LegalSection heading="VAT identification number">
          <p>
            VAT identification number pursuant to § 27a of the German VAT Act
            (UStG): {OPERATOR.vatId}
          </p>
        </LegalSection>
      )}

      <LegalSection heading="Responsible for content (§ 18 (2) MStV)">
        <p>
          {OPERATOR.name
            ? `${OPERATOR.name}, address as above.`
            : "The operator named above."}
        </p>
      </LegalSection>

      <LegalSection heading="Consumer dispute resolution">
        <p>
          We are neither willing nor obliged to take part in dispute resolution
          proceedings before a consumer arbitration board (§ 36 VSBG).
        </p>
      </LegalSection>

      <LegalSection heading="Image credits">
        <p>
          Product and hero photographs are from Unsplash and used under the{" "}
          <a
            href="https://unsplash.com/license"
            target="_blank"
            rel="noreferrer noopener"
          >
            Unsplash License
          </a>
          . Icons are from Lucide (ISC License).
        </p>
      </LegalSection>

      <LegalSection heading="Liability for content and links">
        <p>
          The content of this site has been prepared with care. As a service
          provider we are responsible for our own content on these pages under
          the general laws (§ 7 (1) DDG). We are not obliged to monitor
          transmitted or stored third-party information. Where this site links
          to external websites, their operators alone are responsible for the
          content of those sites.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
