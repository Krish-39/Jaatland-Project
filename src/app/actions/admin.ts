"use server";

import { randomUUID } from "node:crypto";
import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { homepageConfig, products } from "@/db/schema";
import { isShowcaseMode, SHOWCASE_MESSAGE } from "@/db/url";
import { NotAuthorizedError, requireAdmin } from "@/lib/auth/session";
import { firstIssue, homepageConfigSchema, productInputSchema } from "@/lib/validation";

export type AdminResult = { ok: true } | { ok: false; error: string };

const NOT_AUTHORIZED: AdminResult = { ok: false, error: "You are not signed in as an admin." };

/** Runs an admin mutation: authorization first, then the write, then a
 * revalidation of every page that renders catalog data. */
async function adminMutation(run: () => Promise<AdminResult>): Promise<AdminResult> {
  if (isShowcaseMode()) return { ok: false, error: SHOWCASE_MESSAGE };

  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof NotAuthorizedError) return NOT_AUTHORIZED;
    throw error;
  }

  const result = await run();
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

/** Creates a product when `id` is null, otherwise updates that product. */
export async function saveProductAction(id: string | null, input: unknown): Promise<AdminResult> {
  return adminMutation(async () => {
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
    const data = parsed.data;

    const values = {
      name: data.name,
      priceCents: Math.round(data.price * 100),
      category: data.category,
      color: data.color,
      sizes: data.size,
      images: data.images,
      badge: data.badge ?? null,
      similarIds: data.similarIds.filter((similarId) => similarId !== id),
    };

    const db = await getDb();

    if (id === null) {
      const [{ value: lastPosition }] = await db
        .select({ value: max(products.position) })
        .from(products);
      await db.insert(products).values({
        id: `p_${randomUUID().slice(0, 8)}`,
        position: (lastPosition ?? -1) + 1,
        ...values,
      });
      return { ok: true };
    }

    const updated = await db
      .update(products)
      .set(values)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return updated.length > 0
      ? { ok: true }
      : { ok: false, error: "This product no longer exists." };
  });
}

export async function deleteProductAction(id: unknown): Promise<AdminResult> {
  return adminMutation(async () => {
    if (typeof id !== "string" || id.length === 0 || id.length > 64) {
      return { ok: false, error: "Invalid product." };
    }

    const db = await getDb();
    await db.delete(products).where(eq(products.id, id));
    return { ok: true };
  });
}

export async function saveHomepageConfigAction(input: unknown): Promise<AdminResult> {
  return adminMutation(async () => {
    const parsed = homepageConfigSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

    const db = await getDb();
    await db
      .insert(homepageConfig)
      .values({ id: 1, ...parsed.data })
      .onConflictDoUpdate({ target: homepageConfig.id, set: parsed.data });
    return { ok: true };
  });
}
