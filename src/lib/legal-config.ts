// Operator details shown on the legal pages (Legal Notice, Privacy Policy,
// Terms, Right of Withdrawal). German law (§ 5 DDG, Art. 13 GDPR) requires
// these to be the REAL details of whoever runs the site, so they are left
// empty rather than filled with invented values. Fill them in before deploy.

export interface OperatorDetails {
  /** Full legal name of the person or company running the site. */
  name: string;
  /** Street and house number. A PO box is not sufficient. */
  street: string;
  /** Postal code and city. */
  city: string;
  country: string;
  email: string;
  /** Optional, but a second fast contact channel is expected. */
  phone: string;
  /** VAT ID (USt-IdNr.) if one has been issued; leave empty otherwise. */
  vatId: string;
}

export const OPERATOR: OperatorDetails = {
  name: "",
  street: "",
  city: "",
  country: "Germany",
  email: "",
  phone: "",
  vatId: "",
};

/** True once the fields the law requires are filled in. */
export function operatorDetailsComplete(operator: OperatorDetails = OPERATOR): boolean {
  return [operator.name, operator.street, operator.city, operator.country, operator.email].every(
    (value) => value.trim().length > 0
  );
}

export const SITE_NAME = "Jaatland";
export const SITE_URL = "https://store.krriss.cloud";

/** Date the legal texts were last revised (shown on each legal page). */
export const LEGAL_LAST_UPDATED = "17 November 2026";

export const LEGAL_LINKS = [
  { href: "/impressum", label: "Legal Notice" },
  { href: "/datenschutz", label: "Privacy Policy" },
  { href: "/agb", label: "Terms" },
  { href: "/widerruf", label: "Right of Withdrawal" },
  { href: "/versand-zahlung", label: "Shipping & Payment" },
] as const;
