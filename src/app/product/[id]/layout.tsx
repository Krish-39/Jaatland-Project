import type { Metadata } from "next";
import { DEFAULT_PRODUCTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const product = DEFAULT_PRODUCTS.find((p) => p.id === id);

  if (!product) {
    return { title: "Product | Jaatland" };
  }

  return {
    title: `${product.name} | Jaatland`,
    description: `${product.name} — ${formatCurrency(product.price)} · ${product.category} · ${
      product.color
    }. Premium wear from Jaatland Clothing Co.`,
  };
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
