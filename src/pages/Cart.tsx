import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto min-h-[60vh] px-4 py-20">
        <div className="mx-auto max-w-md text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-3xl font-bold">Your cart is empty</h1>
          <p className="mb-6 text-muted-foreground">
            Add some delicious snacks to get started!
          </p>
          <Link to="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingThreshold = 15;
  const isEligibleForFreeShipping = totalPrice >= shippingThreshold;
  const amountUntilFreeShipping = Math.max(0, shippingThreshold - totalPrice);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/products">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>

        <h1 className="mb-8 text-4xl font-bold">Shopping Cart ({totalItems} items)</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{item.brand}</p>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        {item.originalPrice ? (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground line-through">
                              ${item.originalPrice.toFixed(2)}
                            </p>
                            <p className="text-lg font-bold text-primary">
                              ${item.price.toFixed(2)}
                            </p>
                            <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded">
                              {item.discountPercentage}% OFF
                            </span>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-primary">
                            ${item.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-2xl font-bold">Order Summary</h2>
                
                <div className="space-y-2 border-b border-border pb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">
                      {isEligibleForFreeShipping ? (
                        <span className="text-secondary">Free</span>
                      ) : (
                        "$4.99"
                      )}
                    </span>
                  </div>
                </div>

                {!isEligibleForFreeShipping && (
                  <div className="rounded-lg bg-accent p-3 text-sm">
                    Add <span className="font-semibold">${amountUntilFreeShipping.toFixed(2)}</span> more for free shipping!
                  </div>
                )}

                <div className="flex justify-between border-t border-border pt-4 text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ${(totalPrice + (isEligibleForFreeShipping ? 0 : 4.99)).toFixed(2)}
                  </span>
                </div>

                <Button size="lg" className="w-full text-base">
                  Proceed to Checkout
                </Button>

                <Link to="/products">
                  <Button variant="outline" size="lg" className="w-full text-base">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
