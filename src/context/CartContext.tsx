import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageUrls: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, size: string, quantity?: number, product?: Product) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('dreamers_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('dreamers_cart', JSON.stringify(items));
  };

  const refreshCart = async () => {
    // LocalStorage cart doesn't strictly need a network refresh,
    // but we can verify if the products still exist or have updated prices if needed.
    const savedCart = localStorage.getItem('dreamers_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  };

  const addToCart = async (productId: string, size: string, quantity: number = 1, product?: Product) => {
    try {
      setIsLoading(true);
      let productObj = product;

      // Fetch product info from Supabase if not provided
      if (!productObj) {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, discount_price, image_urls')
          .eq('id', productId)
          .single();

        if (error || !data) {
          toast.error('Product details could not be loaded');
          return;
        }

        // Handle image_urls parsing
        let urls: string[] = [];
        if (Array.isArray(data.image_urls)) {
          urls = data.image_urls;
        } else if (typeof data.image_urls === 'string') {
          try {
            urls = JSON.parse(data.image_urls);
          } catch {
            urls = [];
          }
        }

        productObj = {
          id: data.id,
          name: data.name,
          price: Number(data.price),
          discountPrice: data.discount_price ? Number(data.discount_price) : undefined,
          imageUrls: urls,
        };
      }

      const existingIndex = cartItems.findIndex(
        (item) => item.productId === productId && item.size === size
      );

      let updatedCart: CartItem[];
      if (existingIndex > -1) {
        updatedCart = [...cartItems];
        updatedCart[existingIndex].quantity += quantity;
      } else {
        const newItem: CartItem = {
          id: `${productId}-${size}-${Date.now()}`,
          productId,
          size,
          quantity,
          product: productObj,
        };
        updatedCart = [...cartItems, newItem];
      }

      saveCart(updatedCart);
      toast.success('Added to cart!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    const updatedCart = cartItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    saveCart(updatedCart);
  };

  const removeFromCart = async (itemId: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== itemId);
    saveCart(updatedCart);
    toast.success('Removed from cart');
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
