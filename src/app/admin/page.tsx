"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Edit, Trash2, BarChart3, Home, Package } from "lucide-react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Men", "Women", "Unisex", "Accessories"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const COLORS = ["Black", "White", "Blue", "Beige", "Olive", "Maroon", "Red", "Gray", "Green", "Yellow", "Purple", "Pink"] as const;

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  color: string;
  size: string[];
  images: string[];
  badge?: string;
  similarIds: string[];
};

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Classic Tee",
    price: 24.99,
    category: "Unisex",
    color: "Black",
    size: ["S","M","L","XL"],
    images: [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTfW-12ilFXxrNUFgFzxmHLnLjnmeWuDmhdPxTGG9G_6GwDOPCNdaSzG4h9FkKPM_Ekldf1I6q3zFbbVKhkFLjSc3wQ1ebxZ3fToBi0Y8kS&usqp=CAc",
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcREvQkUlykGJPQ7KH-q8dKb9smGYGZh6aqKIfaVnFMGccRf9Frp_dYfXUhI2QZMCB4XRWnqq3EG&usqp=CAc",
    ],
    badge: "Bestseller",
    similarIds: ["p2", "p3", "p4"],
  },
  {
    id: "p2",
    name: "Heritage Oversized Tee",
    price: 29.99,
    category: "Men",
    color: "Beige",
    size: ["M", "L", "XL"],
    images: [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSxARunzvXbWUt6ol8yZKNA9M4GhWTSQaSkRjDiO2mLt_4qPOOHQ8x7UqivF156RTw6M-AUwG-vI-uIx9517tHttN6--7Q6b1s04r1FFJNJ&usqp=CAc",
      "https://img01.ztat.net/article/spp-media-p1/b8df543741694359a8cd0c80bb25fe94/223cf2dfbfad4cd08bdb0a153188281d.jpg?imwidth=762",
    ],
    badge: "New",
    similarIds: ["p1", "p4", "p5"],
  },
  {
    id: "p3",
    name: "Crop Top",
    price: 22.5,
    category: "Women",
    color: "White",
    size: ["XS", "S", "M"],
    images: [
      "https://media.istockphoto.com/id/1457860785/photo/white-crop-top-mockup-with-round-neckline-3d-rendering-female-t-shirt-with-label-isolated-on.jpg?s=612x612&w=0&k=20&c=pUEaMzO-a5Bjj6C6vqFbOIuizGX3erl2DCRu0G1qfD0=",
      "https://www.shutterstock.com/image-photo/white-crop-top-mockup-on-600nw-2261342159.jpg",
    ],
    similarIds: ["p1", "p4"],
  },
  {
    id: "p4",
    name: "Hoodie",
    price: 49.99,
    category: "Unisex",
    color: "gray",
    size: ["M", "L", "XL", "XXL"],
    images: [
      "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRqqKoZObhcYE7PfqYHRRxABdzHXFN0zhQFvI4192x78fdWiQAEiAwzeghw4sDb_B62gL5XID28ckrllWoK56eNts4C8pcqFP1lucABwz1RHA&usqp=CAc",
      "https://img01.ztat.net/article/spp-media-p1/734a1198c51b4c8281d69bf5ff58d716/caf79badaa4c461698f1f45d07ecc076.jpg?imwidth=1800",
    ],
    badge: "Limited",
    similarIds: ["p1", "p2", "p3", "p5"],
  },
  {
    id: "p5",
    name: "Joggers",
    price: 39.99,
    category: "Men",
    color: "Blue",
    size: ["S", "M", "L"],
    images: [
      "https://img01.ztat.net/article/spp-media-p1/80183efd8a0f4a7b9fc916f267bf1c7a/390e343cfbc941329b40d38a36df0064.jpg?imwidth=1800&filter=packshot",
      "https://img01.ztat.net/article/spp-media-p1/13b93c1ea1a4434b8aaf8cbd6dda0d0b/ccc85954d15d4fddb00b4a8b6c52a986.jpg?imwidth=1800",
    ],
    similarIds: ["p2", "p4"],
  },
  {
    id: "p6",
    name: "Hand Bag",
    price: 18.99,
    category: "Accessories",
    color: "red",
    size: ["One"],
    images: [
      "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQrzb1u88c6Ub2FhyQqA-k-UW2wMLW4l7WXkvGgj4PZigE-XWy4lmMtP2EKvmTExp37TKbt1aWI_B95o6itrs3xe52VuTP0wvnGgwbdJnrbS3VF&usqp=CAc",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop",
    ],
    similarIds: [],
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("products");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check authentication - allow access if email is krishahir@jaatland.com
      const adminEmail = localStorage.getItem("jaatland_admin_email");
      if (adminEmail !== "krishahir@jaatland.com") {
        router.push("/");
        return;
      }
      setIsLoggedIn(true);

      const stored = localStorage.getItem("jaatland_products");
      if (stored) {
        try {
          setProducts(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing stored products:", e);
        }
      }
    }
  }, [router]);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    if (typeof window !== "undefined") {
      localStorage.setItem("jaatland_products", JSON.stringify(newProducts));
    }
  };

  const handleAddProduct = () => {
    setIsAdding(true);
    setEditingProduct({
      id: `p${Date.now()}`,
      name: "",
      price: 0,
      category: "",
      color: "",
      size: [],
      images: [],
      similarIds: [],
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsAdding(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const newProducts = products.filter((p) => p.id !== id);
      saveProducts(newProducts);
    }
  };

  const handleSaveProduct = (product: Product) => {
    let newProducts;
    if (isAdding) {
      newProducts = [...products, product];
    } else {
      newProducts = products.map((p) => (p.id === product.id ? product : p));
    }
    saveProducts(newProducts);
    setEditingProduct(null);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("jaatland_admin_email");
              router.push("/");
            }}
            className="gap-2"
          >
            Logout
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

        {activeTab === "dashboard" && <DashboardTab products={products} />}
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
              />
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative h-48">
                  <img
                    src={product.images[0] || "https://via.placeholder.com/400"}
                    alt={product.name}
                    className="h-full w-full object-cover"
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
                <div className="text-lg font-semibold mb-2">€{product.price}</div>
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

function DashboardTab({ products }: { products: Product[] }) {
  // Mock order data - in a real app this would come from a database
  const today = new Date().toISOString().split('T')[0];
  const mockOrders = [
    { id: "o1", date: today, total: 54.98, status: "completed" },
    { id: "o2", date: today, total: 29.99, status: "completed" },
    { id: "o3", date: today, total: 79.97, status: "pending" },
  ];

  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = mockOrders.length;
  const wishlistCount = 5; // Mock data

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wishlistCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">Order #{order.id}</div>
                  <div className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">€{order.total.toFixed(2)}</div>
                  <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HomepageTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [homepageConfig, setHomepageConfig] = useState({
    heroTitle: "Sustainable Fashion for the Modern World",
    heroSubtitle: "Made with ❤️ in Europe. Sustainable fabrics, fair wages, and small-batch production.",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    featuredProducts: ["p1", "p2", "p3"],
    newsletterTitle: "Join the Jaatland club",
    newsletterSubtitle: "Get early access to drops, exclusive discounts, and behind-the-scenes stories.",
    homepageProducts: {
      Men: [] as string[],
      Women: [] as string[],
      Unisex: [] as string[],
      Accessories: [] as string[],
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("jaatland_products");
      if (stored) {
        try {
          setProducts(JSON.parse(stored));
        } catch (e) {
          console.error("Error parsing stored products:", e);
        }
      }
      const storedHomepage = localStorage.getItem("jaatland_homepage");
      if (storedHomepage) {
        try {
          const parsed = JSON.parse(storedHomepage);
          setHomepageConfig(prev => ({
            ...prev,
            ...parsed,
            homepageProducts: parsed.homepageProducts || prev.homepageProducts,
          }));
        } catch (e) {
          console.error("Error parsing homepage config:", e);
        }
      }
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jaatland_homepage", JSON.stringify(homepageConfig));
      alert("Homepage settings saved!");
    }
  };

  const toggleProductInCategory = (category: string, productId: string) => {
    setHomepageConfig(prev => {
      const categoryProducts = (prev.homepageProducts?.[category as keyof typeof prev.homepageProducts] || []) as string[];
      const isSelected = categoryProducts.includes(productId);
      return {
        ...prev,
        homepageProducts: {
          ...prev.homepageProducts,
          [category]: isSelected
            ? categoryProducts.filter(id => id !== productId)
            : [...categoryProducts, productId],
        },
      };
    });
  };

  const selectAllInCategory = (category: string) => {
    const categoryProducts = products.filter(p => p.category === category).map(p => p.id);
    setHomepageConfig(prev => ({
      ...prev,
      homepageProducts: {
        ...prev.homepageProducts,
        [category]: categoryProducts,
      },
    }));
  };

  const clearCategory = (category: string) => {
    setHomepageConfig(prev => ({
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
              onChange={(e) => setHomepageConfig(prev => ({ ...prev, heroTitle: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Input
              id="heroSubtitle"
              value={homepageConfig.heroSubtitle}
              onChange={(e) => setHomepageConfig(prev => ({ ...prev, heroSubtitle: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="heroImage">Hero Image URL</Label>
            <Input
              id="heroImage"
              value={homepageConfig.heroImage}
              onChange={(e) => setHomepageConfig(prev => ({ ...prev, heroImage: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Products by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {CATEGORIES.map(category => {
            const categoryProducts = products.filter(p => p.category === category);
            const selectedProducts = homepageConfig.homepageProducts?.[category as keyof typeof homepageConfig.homepageProducts] || [];
            
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
                <p className="text-sm text-gray-500 mb-3">
                  {selectedProducts.length} of {categoryProducts.length} products selected for homepage
                </p>
                {categoryProducts.length === 0 ? (
                  <p className="text-sm text-gray-400">No products in this category. Add products first.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {categoryProducts.map(product => (
                      <label
                        key={product.id}
                        className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleProductInCategory(category, product.id)}
                        />
                        <img
                          src={product.images[0] || "https://via.placeholder.com/40"}
                          alt={product.name}
                          className="w-8 h-8 rounded object-cover"
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
              onChange={(e) => setHomepageConfig(prev => ({ ...prev, newsletterTitle: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="newsletterSubtitle">Newsletter Subtitle</Label>
            <Input
              id="newsletterSubtitle"
              value={homepageConfig.newsletterSubtitle}
              onChange={(e) => setHomepageConfig(prev => ({ ...prev, newsletterSubtitle: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Homepage Settings</Button>
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
}: {
  product: Product;
  allProducts: Product[];
  onSave: (product: Product) => void;
  onCancel: () => void;
  isAdding: boolean;
}) {
  const [formData, setFormData] = useState<Product>(product);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product.size || []);
  const [selectedSimilar, setSelectedSimilar] = useState<string[]>(product.similarIds || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProduct = {
      ...formData,
      size: selectedSizes,
      similarIds: selectedSimilar,
    };
    onSave(updatedProduct);
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    setSelectedSizes((prev) =>
      checked ? [...prev, size] : prev.filter((s) => s !== size)
    );
  };

  const handleSimilarChange = (id: string, checked: boolean) => {
    setSelectedSimilar((prev) =>
      checked ? [...prev, id] : prev.filter((s) => s !== id)
    );
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
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value || undefined }))}
              placeholder="e.g., Bestseller, New"
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
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={image}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="Image URL"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(index)}
                >
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
            <Button type="submit">{isAdding ? "Add Product" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
