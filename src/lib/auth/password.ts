import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

// Password hashing with scrypt from Node's standard library.
// Stored format: scrypt$<log2 N>$<r>$<p>$<salt base64url>$<hash base64url>
// The parameters travel with the hash so they can be raised later without
// invalidating existing passwords.

const LOG_N = 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const MAX_MEMORY = 128 * 1024 * 1024;

function derive(
  password: string,
  salt: Buffer,
  logN: number,
  r: number,
  p: number,
  keyLength: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      keyLength,
      { N: 2 ** logN, r, p, maxmem: MAX_MEMORY },
      (error, key) => (error ? reject(error) : resolve(key))
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, LOG_N, R, P, KEY_LENGTH);
  return ["scrypt", LOG_N, R, P, salt.toString("base64url"), key.toString("base64url")].join("$");
}

/** Constant-time check. Returns false for malformed hashes instead of throwing. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [logN, r, p] = parts.slice(1, 4).map(Number);
  if (![logN, r, p].every(Number.isInteger) || logN < 10 || logN > 20 || r < 1 || p < 1) {
    return false;
  }

  try {
    const salt = Buffer.from(parts[4], "base64url");
    const expected = Buffer.from(parts[5], "base64url");
    if (salt.length === 0 || expected.length === 0) return false;

    const actual = await derive(password, salt, logN, r, p, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** A valid hash of a random password. Verifying against it makes a login for
 * an unknown email take as long as one for a known email. */
export const DUMMY_PASSWORD_HASH: Promise<string> = hashPassword(
  randomBytes(24).toString("base64url")
);
