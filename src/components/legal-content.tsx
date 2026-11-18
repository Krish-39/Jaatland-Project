import {
  LEGAL_LAST_UPDATED,
  OPERATOR,
  operatorDetailsComplete,
} from "@/lib/legal-config";

// Small building blocks shared by the legal pages so they read consistently.

export function LegalArticle({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-8 leading-relaxed">
      <header>
        <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated: {LEGAL_LAST_UPDATED}
        </p>
      </header>
      {children}
    </article>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{heading}</h2>
      <div className="space-y-3 text-[15px] text-slate-700 dark:text-slate-300 [&_a]:underline [&_a]:underline-offset-2 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}

/** The notice every legal page carries while the site is a demo. */
export function DemoNotice() {
  return (
    <p className="rounded-md border bg-muted text-foreground p-4 text-sm">
      <strong>This website is a demonstration.</strong> No goods are sold, no
      contract is concluded when an order is placed, no real payment is taken
      (payments run in Stripe test mode) and
      nothing is shipped.
    </p>
  );
}

/** Operator name and address, or a clear warning while they are missing. */
export function OperatorAddress() {
  if (!operatorDetailsComplete()) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100"
      >
        The operator&apos;s name, address and contact details have not been
        entered yet. They must be added in <code>src/lib/legal-config.ts</code>{" "}
        before this site is made public.
      </p>
    );
  }

  return (
    <address className="not-italic">
      {OPERATOR.name}
      <br />
      {OPERATOR.street}
      <br />
      {OPERATOR.city}
      <br />
      {OPERATOR.country}
      <br />
      <br />
      Email: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
      {OPERATOR.phone && (
        <>
          <br />
          Phone: {OPERATOR.phone}
        </>
      )}
    </address>
  );
}
