"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Edit, Trash2, BarChart3, Home, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import {
  deleteProductAction,
  saveHomepageConfigAction,
  saveProductAction,
} from "@/app/actions/admin";
import { CATEGORIES, SIZES, COLORS } from "@/lib/mock-data";
import type { AdminStats } from "@/lib/data/orders";
import { formatCurrency } from "@/lib/utils";
import { HomepageConfig, Product, ProductCategory, ProductSize } from "@/lib/types";
import { useStore } from "@/components/store-provider";


// Rendered only after the server has confirmed an admin session (see
// src/app/admin/page.tsx). Every save goes through a server action that
// checks the session again, so this component grants no access by itself.
export function AdminPanel({ stats }: { stats: AdminStats }) {
  const router = useRouter();
  const { products, logout, notify } = useStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddProduct = () => {
    setIsAdding(true);
    setEditingProduct({
      id: "",
      name: "",
      price: 0,
      category: "Men" as ProductCategory,
      color: "",
      size: [] as ProductSize[],
      images: [],
      similarIds: [],
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsAdding(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const result = await deleteProductAction(id);
      notify(result.ok ? "Product deleted" : result.error);
    } catch {
      notify("Could not delete the product. Please try again.");
    }
  };

  const handleSaveProduct = async (product: Product) => {
    setIsSaving(true);
    try {
      const result = await saveProductAction(isAdding ? null : product.id, {
        name: product.name,
        price: product.price,
        category: product.category,
        color: product.color,
        size: product.size,
        images: product.images,
        badge: product.badge,
        similarIds: product.similarIds,
      });

      if (!result.ok) {
        notify(result.error);
        return;
      }

      notify(isAdding ? "Product added" : "Product saved");
      setEditingProduct(null);
      setIsAdding(false);
    } catch {
      notify("Could not save the product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAdding(false);
  };

  return (
    <div className="min-h-[60vh] bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-5xl">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="gap-2"
          >
            Sign out
          </Button>
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            variant={activeTab === "dashboard" ? "default" : "outline"}
            onClick={() => setActiveTab("dashboard")}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Products
          </Button>
          <Button
            variant={activeTab === "homepage" ? "default" : "outline"}
            onClick={() => setActiveTab("homepage")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Homepage
          </Button>
        </div>

        {activeTab === "dashboard" && <DashboardTab stats={stats} />}
        {activeTab === "products" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Products</h2>
              <Button onClick={handleAddProduct} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            {editingProduct && (
              <ProductForm
                product={editingProduct}
                allProducts={products}
                onSave={handleSaveProduct}
                onCancel={handleCancel}
                isAdding={isAdding}
                isSaving={isSaving}
              />
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                      <ProductImage
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                      {product.badge && (
                        <Badge className="absolute left-3 top-3" variant="secondary">
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {product.category} • {product.color}
                    </div>
                    <div className="text-lg font-semibold mb-2">{formatCurrency(product.price)}</div>
                    <div className="text-sm mb-2">
                      <strong>Sizes:</strong> {product.size.join(", ")}
                    </div>
                    <div className="text-sm mb-4">
                      <strong>Similar:</strong> {(product.similarIds || []).length} products
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
        {activeTab === "homepage" && <HomepageTab />}
      </div>
    </div>
  );
}

function DashboardTab({ stats }: { stats: AdminStats }) {
  const tiles = [
    { label: "Total Products", value: String(stats.productCount) },
    { label: "Total Orders", value: String(stats.orderCount) },
    { label: "Order Value", value: formatCurrency(stats.revenue) },
    { label: "Customers", value: String(stats.customerCount) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{tile.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-display text-4xl">{tile.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No orders yet. They&apos;ll appear here once customers check out.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-4 border-b pb-2"
                >
                  <div className="min-w-0">
                    <div className="font-medium">Order #{order.id}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("en-IE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {order.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(order.total)}</div>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Demo orders: no payment is taken, and orders are deleted
            automatically after 30 days.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function HomepageTab() {
  const {
    products,
    homepageConfig: storedConfig,
    notify,
  } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [homepageConfig, setHomepageConfig] =
    useState<HomepageConfig>(storedConfig);

  useEffect(() => {
    setHomepageConfig(storedConfig);
  }, [storedConfig]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveHomepageConfigAction(homepageConfig);
      notify(result.ok ? "Homepage settings saved" : result.error);
    } catch {
      notify("Could not save homepage settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProductInCategory = (category: string, productId: string) => {
    setHomepageConfig((prev) => {
      const categoryProducts = (prev.homepageProducts?.[category as keyof typeof prev.homepageProducts] ||
        []) as string[];
      const isSelected = categoryProducts.includes(productId);
      return {
        ...prev,
        homepageProducts: {
          ...prev.homepageProducts,
          [category]: isSelected
            ? categoryProducts.filter((id) => id !== productId)
            : [...categoryProducts, productId],
        },
      };
    });
  };

  const selectAllInCategory = (category: string) => {
    const categoryProducts = products.filter((p) => p.category === category).map((p) => p.id);
    setHomepageConfig((prev) => ({
      ...prev,
      homepageProducts: {
        ...prev.homepageProducts,
        [category]: categoryProducts,
      },
    }));
  };

  const clearCategory = (category: string) => {
    setHomepageConfig((prev) => ({
      ...prev,
      homepageProducts: {
        ...prev.homepageProducts,
        [category]: [],
      },
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="heroTitle">Hero Title</Label>
            <Input
              id="heroTitle"
              value={homepageConfig.heroTitle}
              onChange={(e) => setHomepageConfig((prev) => ({ ...prev, heroTitle: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Input
              id="heroSubtitle"
              value={homepageConfig.heroSubtitle}
              onChange={(e) => setHomepageConfig((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="heroImage">Hero Image URL</Label>
            <Input
              id="heroImage"
              value={homepageConfig.heroImage}
              onChange={(e) => setHomepageConfig((prev) => ({ ...prev, heroImage: e.target.value }))}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use a file under <code>/products/</code> or an
              <code> images.unsplash.com</code> URL. Only use images you hold
              the rights to; other hosts show a placeholder.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Products by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {CATEGORIES.map((category) => {
            const categoryProducts = products.filter((p) => p.category === category);
            const selectedProducts =
              homepageConfig.homepageProducts?.[category as keyof typeof homepageConfig.homepageProducts] || [];

            return (
              <div key={category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{category} Section</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => selectAllInCategory(category)}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => clearCategory(category)}>
                      Clear
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedProducts.length} of {categoryProducts.length} products selected for homepage
                </p>
                {categoryProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products in this category. Add products first.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {categoryProducts.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductInCategory(category, product.id)}
                        />
                        <ProductImage
                          src={product.images[0]}
                          alt={product.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded"
                        />
                        <span className="text-sm truncate">{product.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Newsletter Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newsletterTitle">Newsletter Title</Label>
            <Input
              id="newsletterTitle"
              value={homepageConfig.newsletterTitle}
              onChange={(e) => setHomepageConfig((prev) => ({ ...prev, newsletterTitle: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="newsletterSubtitle">Newsletter Subtitle</Label>
            <Input
              id="newsletterSubtitle"
              value={homepageConfig.newsletterSubtitle}
              onChange={(e) => setHomepageConfig((prev) => ({ ...prev, newsletterSubtitle: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save Homepage Settings"}
        </Button>
      </div>
    </div>
  );
}

function ProductForm({
  product,
  allProducts,
  onSave,
  onCancel,
  isAdding,
  isSaving,
}: {
  product: Product;
  allProducts: Product[];
  onSave: (product: Product) => void;
  onCancel: () => void;
  isAdding: boolean;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<Product>(product);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product.size || []);
  const [selectedSimilar, setSelectedSimilar] = useState<string[]>(product.similarIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProduct: Product = {
      ...formData,
      category: formData.category as ProductCategory,
      size: selectedSizes as ProductSize[],
      similarIds: selectedSimilar,
    };
    onSave(updatedProduct);
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    setSelectedSizes((prev) => (checked ? [...prev, size] : prev.filter((s) => s !== size)));
  };

  const handleSimilarChange = (id: string, checked: boolean) => {
    setSelectedSimilar((prev) => (checked ? [...prev, id] : prev.filter((s) => s !== id)));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value as ProductCategory }));
  };

  const handleColorChange = (value: string) => {
    setFormData((prev) => ({ ...prev, color: value }));
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));
  };

  const handlePriceChange = (value: number) => {
    setFormData((prev) => ({ ...prev, price: value }));
  };

  const handleBadgeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, badge: value || undefined }));
  };

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const updateImage = (index: number, url: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? url : img)),
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{isAdding ? "Add Product" : "Edit Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <select
                value={formData.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select color</option>
                {COLORS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Badge (optional)</Label>
            <Input
              value={formData.badge || ""}
              onChange={(e) => handleBadgeChange(e.target.value)}
              placeholder="e.g. New Arrival, Limited Edition"
            />
          </div>

          <div>
            <Label>Sizes</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {SIZES.map((size) => (
                <label key={size} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Images</Label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use a file under <code>/products/</code> or an
              <code> images.unsplash.com</code> URL. Only use images you hold
              the rights to; other hosts show a placeholder.
            </p>
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="Image URL"
                  className="flex-1"
                />
                <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addImage} className="mt-2">
              Add Image
            </Button>
          </div>

          <div>
            <Label>Similar Products</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
              {allProducts
                .filter((p) => p.id !== formData.id)
                .map((p) => (
                  <label key={p.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedSimilar.includes(p.id)}
                      onCheckedChange={(checked) => handleSimilarChange(p.id, checked as boolean)}
                    />
                    {p.name}
                  </label>
                ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : isAdding ? "Add Product" : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

