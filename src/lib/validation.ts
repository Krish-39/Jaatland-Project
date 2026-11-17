import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/auth/password-policy";
import { CATEGORIES, COLORS } from "@/lib/mock-data";
import { isAllowedImageSrc } from "@/lib/utils";

// Every value that crosses from the browser to the server is parsed with one
// of these schemas first. Client-side form checks are a convenience only.

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(MAX_PASSWORD_LENGTH),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters for your password`)
    .max(MAX_PASSWORD_LENGTH, "That password is too long"),
});

const PRODUCT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One"] as const;
const productId = z.string().trim().min(1).max(64);

const imageSrc = z
  .string()
  .trim()
  .max(500)
  .refine(isAllowedImageSrc, "Images must be a /products/ file or an images.unsplash.com URL");

export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  price: z
    .number("Price must be a number")
    .min(0.01, "Price must be at least €0.01")
    .max(10_000, "Price is too high")
    .refine((value) => Number.isInteger(Math.round(value * 100)), "Invalid price"),
  category: z.enum(CATEGORIES),
  color: z.enum(COLORS, "Choose a colour"),
  size: z.array(z.enum(PRODUCT_SIZES)).max(PRODUCT_SIZES.length),
  images: z
    .array(z.string())
    .max(8)
    .transform((list) => list.map((src) => src.trim()).filter(Boolean))
    .pipe(z.array(imageSrc)),
  badge: z
    .string()
    .trim()
    .max(30)
    .optional()
    .transform((value) => value || undefined),
  similarIds: z.array(productId).max(12),
});

export type ProductInput = z.infer<typeof productInputSchema>;

const idList = z.array(productId).max(50);

export const homepageConfigSchema = z.object({
  heroTitle: z.string().trim().max(120),
  heroSubtitle: z.string().trim().max(400),
  heroImage: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || isAllowedImageSrc(value), {
      message: "Hero image must be a /products/ file or an images.unsplash.com URL",
    }),
  newsletterTitle: z.string().trim().max(120),
  newsletterSubtitle: z.string().trim().max(400),
  homepageProducts: z.object({
    Men: idList,
    Women: idList,
    Unisex: idList,
    Accessories: idList,
  }),
});

const cartLine = z.object({
  id: productId,
  size: z.enum(PRODUCT_SIZES).optional(),
  qty: z.number().int().min(1).max(99),
});

export const placeOrderSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(2, "Enter your full name").max(120),
  address: z.string().trim().min(3, "Enter your street and house number").max(200),
  city: z.string().trim().min(2, "Enter your city").max(100),
  zip: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Enter a valid German postal code (5 digits)"),
  items: z.array(cartLine).min(1, "Your cart is empty").max(50),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

/** A guest's proof that an order is theirs: the id plus its secret token. */
export const guestOrderRefsSchema = z
  .array(z.object({ id: z.string().max(40), token: z.string().min(20).max(100) }))
  .max(25);

/** First human-readable message from a failed parse. */
export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
