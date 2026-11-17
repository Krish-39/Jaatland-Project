import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { getProduct, getProducts } from "@/lib/data/catalog";
import { SITE_URL } from "@/lib/legal-config";
import { formatCurrency, getImageUrl } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

// Prerender the current catalog; products added later render on first visit.
export async function generateStaticParams() {
  return (await getProducts()).map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found" };

  const description = `${product.name} — ${formatCurrency(product.price)} incl. VAT · ${product.category} · ${product.color}. From Jaatland Clothing Co.`;
  const image = getImageUrl(product);

  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const image = getImageUrl(product);
  // Structured data so search engines can show the product with its price.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    color: product.color,
    category: product.category,
    image: image ? [new URL(image, SITE_URL).toString()] : undefined,
    brand: { "@type": "Brand", name: "Jaatland" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // "<" is escaped so product text can never close the script element.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail id={product.id} />
    </>
  );
}
