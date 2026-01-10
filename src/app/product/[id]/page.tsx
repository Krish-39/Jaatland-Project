"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

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

// ---- Mock Data (same as home page) ----
const DEFAULT_PRODUCTS = [
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

const PRODUCTS = (() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("jaatland_products");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((p: unknown): Product => {
          const productData = p as Partial<Product>;
          return {
            ...productData,
            images: Array.isArray(productData.images) && productData.images.length > 0 
              ? productData.images 
              : ["https://via.placeholder.com/400"],
          } as Product;
        });
      } catch (e) {
        console.error("Error parsing stored products:", e);
      }
    }
  }
  return DEFAULT_PRODUCTS;
})();

function currency(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);
}

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [cart, setCart] = useState<{ id: string; size: string; qty: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = PRODUCTS.find((p: Product) => p.id === id);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("jaatland_cart");
      const savedWL = localStorage.getItem("jaatland_wishlist");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Error parsing cart:", e);
        }
      }
      if (savedWL) {
        try {
          setWishlist(JSON.parse(savedWL));
        } catch (e) {
          console.error("Error parsing wishlist:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("jaatland_cart", JSON.stringify(cart));
      } catch (e) {
        console.error("Error saving cart:", e);
      }
    }
  }, [cart]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("jaatland_wishlist", JSON.stringify(wishlist));
      } catch (e) {
        console.error("Error saving wishlist:", e);
      }
    }
  }, [wishlist]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const addToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    setCart((prev) => {
      const found = prev.find((i) => i.id === product.id && i.size === selectedSize);
      if (found) {
        return prev.map((i) => 
          (i.id === product.id && i.size === selectedSize) 
            ? { ...i, qty: i.qty + 1 } 
            : i
        );
      }
      return [...prev, { id: product.id, size: selectedSize, qty: 1 }];
    });
    // Show visual confirmation
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleWishlist = () => {
    setWishlist((prev) => (prev.includes(product.id) ? prev.filter((x) => x !== product.id) : [...prev, product.id]));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          
          {/* Cart Icon with Item Count */}
          <div className="relative" onClick={() => router.push("/checkout")}>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Image Carousel */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-3xl shadow-2xl">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.badge && <Badge>{product.badge}</Badge>}
              </div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-2">
                {currency(product.price)}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Color</h3>
              <p className="text-gray-600 dark:text-gray-400">{product.color}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Size</h3>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select size</option>
                {product.size.map((s: string) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={addToCart} 
                className={`flex-1 gap-2 transition-all ${addedToCart ? 'bg-green-600 hover:bg-green-700' : ''}`} 
                size="lg"
              >
                <ShoppingCart className="h-5 w-5" />
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleWishlist}
                className={wishlist.includes(product.id) ? "text-red-600 border-red-600" : ""}
              >
                <Heart className={`h-5 w-5 ${wishlist.includes(product.id) ? "fill-current" : ""}`} />
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Color:</strong> {product.color}</p>
                <p><strong>Sizes:</strong> {product.size.join(", ")}</p>
                <p><strong>Price:</strong> {currency(product.price)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

