"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51S2XmpRowOCkn0yW6eRFRhtiPIjWaef5O4nUzmD6UmVvKNhji21WYpJfVPmRJylApvfHm0izwc6ewouSJfuQKsgy00CBtgakG9");

function currency(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);
}

// ---- Mock Data (same as home page) ----
const CATEGORIES = ["Men", "Women", "Unisex", "Accessories"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const COLORS = ["Black", "White", "Blue", "Beige", "Olive", "Maroon"] as const;

type Product = {
  id: string;
  name: string;
  price: number;
  category: (typeof CATEGORIES)[number];
  color: (typeof COLORS)[number] | string;
  size: string[];
  images: string[];
  badge?: string;
  similarIds: string[];
};

type Order = {
  id: string;
  date: string;
  items: { id: string; name: string; price: number; qty: number; image: string }[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered";
  shippingInfo: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Tee", price: 24.99, category: "Unisex", color: "Black", size: ["S","M","L","XL"], images: ["https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTfW-12ilFXxrNUFgFzxmHLnLjnmeWuDmhdPxTGG9G_6GwDOPCNdaSzG4h9FkKPM_Ekldf1I6q3zFbbVKhkFLjSc3wQ1ebxZ3fToBi0Y8kS&usqp=CAc"], badge: "Bestseller", similarIds: ["p2", "p3", "p4"] },
  { id: "p2", name: "Heritage Oversized Tee", price: 29.99, category: "Men", color: "Beige", size: ["M","L","XL"], images: ["https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSxARunzvXbWUt6ol8yZKNA9M4GhWTSQaSkRjDiO2mLt_4qPOOHQ8x7UqivF156RTw6M-AUwG-vI-uIx9517tHttN6--7Q6b1s04r1FFJNJ&usqp=CAc"], badge: "New", similarIds: ["p1", "p4", "p5"] },
  { id: "p3", name: "Nazaare Crop Top", price: 22.5, category: "Women", color: "White", size: ["XS","S","M"], images: ["https://media.istockphoto.com/id/1457860785/photo/white-crop-top-mockup-with-round-neckline-3d-rendering-female-t-shirt-with-label-isolated-on.jpg?s=612x612&w=0&k=20&c=pUEaMzO-a5Bjj6C6vqFbOIuizGX3erl2DCRu0G1qfD0="], similarIds: ["p1", "p4"] },
  { id: "p4", name: "Desi Flex Hoodie", price: 49.99, category: "Unisex", color: "gray", size: ["M","L","XL","XXL"], images: ["https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRqqKoZObhcYE7PfqYHRRxABdzHXFN0zhQFvI4192x78fdWiQAEiAwzeghw4sDb_B62gL5XID28ckrllWoK56eNts4C8pcqFP1lucABwz1RHA&usqp=CAc"], badge: "Limited", similarIds: ["p1", "p2", "p3", "p5"] },
  { id: "p5", name: "Roadrunner Joggers", price: 39.99, category: "Men", color: "Blue", size: ["S","M","L"], images: ["https://img01.ztat.net/article/spp-media-p1/80183efd8a0f4a7b9fc916f267bf1c7a/390e343cfbc941329b40d38a36df0064.jpg?imwidth=1800&filter=packshot"], similarIds: ["p2", "p4"] },
  { id: "p6", name: "Nakhre Tote", price: 18.99, category: "Accessories", color: "red", size: ["One"], images: ["https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQrzb1u88c6Ub2FhyQqA-k-UW2wMLW4l7WXkvGgj4PZigE-XWy4lmMtP2EKvmTExp37TKbt1aWI_B95o6itrs3xe52VuTP0wvnGgwbdJnrbS3VF&usqp=CAc"], similarIds: [] },
];

// Products will be loaded from localStorage on client side

// Checkout Form Component
function CheckoutForm({ cart, total, onSuccess, products, user }: { cart: { id: string; qty: number }[], total: number, onSuccess: () => void, products: Product[], user: {email: string} | null }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Germany"
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});



  const validateShippingInfo = () => {
    const errors: Record<string, string> = {};

    if (!shippingInfo.name.trim()) {
      errors.name = "Full name is required";
    }

    if (!shippingInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!shippingInfo.address.trim()) {
      errors.address = "Address is required";
    }

    if (!shippingInfo.city.trim()) {
      errors.city = "City is required";
    }

    if (!shippingInfo.postalCode.trim()) {
      errors.postalCode = "Postal code is required";
    } else if (!/^\d{5}$/.test(shippingInfo.postalCode)) {
      errors.postalCode = "Please enter a valid 5-digit postal code";
    }

    if (!shippingInfo.country.trim()) {
      errors.country = "Country is required";
    }

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateShippingInfo()) {
      setMessage("Please correct the errors above");
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      // Confirm payment with PaymentElement
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: shippingInfo.email,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || "An error occurred during payment");
        console.error('Payment failed:', error);
      } else {
        setMessage("Payment successful!");
        // Create order record
        const order: Order = {
          id: `ORD-${Date.now()}`,
          date: new Date().toISOString(),
          items: cart.map(item => {
            const product = products.find((p: Product) => p.id === item.id)!;
            return {
              id: product.id,
              name: product.name,
              price: product.price,
              qty: item.qty,
              image: product.images[0]
            };
          }),
          total,
          status: "Processing",
          shippingInfo
        };

        // Save order to localStorage
        const savedOrders = localStorage.getItem("jaatland_orders");
        const orders = savedOrders ? JSON.parse(savedOrders) : [];
        orders.push(order);
        localStorage.setItem("jaatland_orders", JSON.stringify(orders));

        // Ensure user remains logged in
        if (user) {
          localStorage.setItem("jaatland_user", JSON.stringify(user));
        }

        // Clear cart
        localStorage.removeItem("jaatland_cart");
        onSuccess();
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred during payment');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={shippingInfo.name}
                onChange={(e) => {
                  setShippingInfo(prev => ({ ...prev, name: e.target.value }));
                  if (shippingErrors.name) setShippingErrors(prev => ({ ...prev, name: "" }));
                }}
                className={shippingErrors.name ? "border-red-500" : ""}
                required
              />
              {shippingErrors.name && <p className="text-red-500 text-sm mt-1">{shippingErrors.name}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={shippingInfo.email}
                onChange={(e) => {
                  setShippingInfo(prev => ({ ...prev, email: e.target.value }));
                  if (shippingErrors.email) setShippingErrors(prev => ({ ...prev, email: "" }));
                }}
                className={shippingErrors.email ? "border-red-500" : ""}
                required
              />
              {shippingErrors.email && <p className="text-red-500 text-sm mt-1">{shippingErrors.email}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={shippingInfo.address}
              onChange={(e) => {
                setShippingInfo(prev => ({ ...prev, address: e.target.value }));
                if (shippingErrors.address) setShippingErrors(prev => ({ ...prev, address: "" }));
              }}
              className={shippingErrors.address ? "border-red-500" : ""}
              required
            />
            {shippingErrors.address && <p className="text-red-500 text-sm mt-1">{shippingErrors.address}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={shippingInfo.city}
                onChange={(e) => {
                  setShippingInfo(prev => ({ ...prev, city: e.target.value }));
                  if (shippingErrors.city) setShippingErrors(prev => ({ ...prev, city: "" }));
                }}
                className={shippingErrors.city ? "border-red-500" : ""}
                required
              />
              {shippingErrors.city && <p className="text-red-500 text-sm mt-1">{shippingErrors.city}</p>}
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={shippingInfo.postalCode}
                onChange={(e) => {
                  setShippingInfo(prev => ({ ...prev, postalCode: e.target.value }));
                  if (shippingErrors.postalCode) setShippingErrors(prev => ({ ...prev, postalCode: "" }));
                }}
                className={shippingErrors.postalCode ? "border-red-500" : ""}
                required
              />
              {shippingErrors.postalCode && <p className="text-red-500 text-sm mt-1">{shippingErrors.postalCode}</p>}
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={shippingInfo.country}
                onChange={(e) => {
                  setShippingInfo(prev => ({ ...prev, country: e.target.value }));
                  if (shippingErrors.country) setShippingErrors(prev => ({ ...prev, country: "" }));
                }}
                className={shippingErrors.country ? "border-red-500" : ""}
                required
              />
              {shippingErrors.country && <p className="text-red-500 text-sm mt-1">{shippingErrors.country}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Payment Method</Label>
            <div className="mt-2">
              <PaymentElement
                options={{
                  layout: 'tabs',
                  paymentMethodOrder: ['card', 'paypal', 'apple_pay', 'google_pay'],
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4" />
            Your payment information is secure and encrypted with SSL/TLS. We use Stripe for secure payment processing and never store your card details.
          </div>
          {message && (
            <div className={`p-3 rounded-md text-sm ${message.includes('successful') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : `Pay ${currency(total)}`}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ id: string; qty: number }[]>([]);
  const [user, setUser] = useState<{email: string} | null>(null);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Load cart, user, and products
    const savedCart = localStorage.getItem("jaatland_cart");
    const savedUser = localStorage.getItem("jaatland_user");
    const savedProducts = localStorage.getItem("jaatland_products");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart:", e);
      }
    }
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      } catch (e) {
        console.error("Error parsing products:", e);
      }
    }
  }, []);

  const total = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product?.price || 0) * item.qty;
  }, 0);

  // Create payment intent when total changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (total > 0) {
        try {
          const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: total }),
          });
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error('Error creating payment intent:', error);
        }
      }
    };

    createPaymentIntent();
  }, [total]);

  const handlePaymentSuccess = () => {
    router.push('/'); // Redirect to home page
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => router.push('/')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to checkout</h1>
          <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => {
                  const product = products.find((p) => p.id === item.id)!;
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">
                          Quantity: {item.qty} × {currency(product.price)}
                        </div>
                      </div>
                      <div className="font-semibold">{currency(product.price * item.qty)}</div>
                    </div>
                  );
                })}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{currency(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm cart={cart} total={total} onSuccess={handlePaymentSuccess} products={products} user={user} />
              </Elements>
            ) : (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Loading payment form...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
