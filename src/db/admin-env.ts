// Explains, without revealing any value, whether the build can see the
// admin credentials. Printed in the deploy log by scripts/db-migrate.ts.

export interface AdminEnvReport {
  emailSet: boolean;
  passwordSet: boolean;
  /** Variable names that look like the admin ones but are not exact,
   * e.g. "ADMIN_EMAIL." or "admin_email". Names only, never values. */
  lookalikes: string[];
}

const EXACT = new Set(["ADMIN_EMAIL", "ADMIN_PASSWORD"]);

export function adminEnvReport(env: Record<string, string | undefined>): AdminEnvReport {
  const lookalikes = Object.keys(env)
    .filter((name) => !EXACT.has(name))
    .filter((name) => {
      const normalized = name.toUpperCase().replace(/[^A-Z]/g, "");
      return normalized === "ADMINEMAIL" || normalized === "ADMINPASSWORD";
    })
    .sort();

  return {
    emailSet: !!env.ADMIN_EMAIL?.trim(),
    passwordSet: !!env.ADMIN_PASSWORD,
    lookalikes,
  };
}

/** Log lines for the build output. Contains no secret values. */
export function describeAdminEnv(
  report: AdminEnvReport,
  vercelEnv: string | undefined
): string[] {
  const lines = [
    `ADMIN_EMAIL: ${report.emailSet ? "set" : "missing"}`,
    `ADMIN_PASSWORD: ${report.passwordSet ? "set" : "missing"}`,
  ];
  if (report.emailSet && report.passwordSet) return lines;

  if (report.lookalikes.length > 0) {
    lines.push(
      `Found similarly named variables: ${report.lookalikes
        .map((name) => JSON.stringify(name))
        .join(", ")}. Rename them to exactly ADMIN_EMAIL and ADMIN_PASSWORD.`
    );
  }
  const environment = vercelEnv ? `"${vercelEnv}"` : "this";
  lines.push(
    "WARNING: no admin account was created or updated.",
    `Fix: Vercel > Settings > Environment Variables > add ADMIN_EMAIL and ADMIN_PASSWORD, tick the ${environment} environment, then redeploy.`
  );
  return lines;
}
