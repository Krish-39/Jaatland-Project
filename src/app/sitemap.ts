import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/catalog";
import { LEGAL_LINKS, SITE_URL } from "@/lib/legal-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...products.map((product) => ({
      url: `${SITE_URL}/product/${product.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...LEGAL_LINKS.map((link) => ({
      url: `${SITE_URL}${link.href}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
