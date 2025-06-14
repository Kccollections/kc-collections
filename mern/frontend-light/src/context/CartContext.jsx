import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { addToCart as apiAddToCart, updateCartItem, removeFromCart, clearCart as apiClearCart, getUserCart } from '../services/realApi';

// Create Cart Context
const CartContext = createContext();

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart from localStorage or API on mount and when user changes
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        
        if (user) {
          // Fetch cart from API
          try {
            const cartData = await getUserCart(user.id);
            if (cartData && cartData.items) {
              // Transform API response to match our cart structure
              const transformedCart = cartData.items.map(item => ({
                id: item.productId._id || item.productId,
                name: item.productId.name || 'Product',
                price: item.productId.price || 0,
                image: item.productId.images && item.productId.images.length > 0 
                  ? item.productId.images[0] 
                  : '/images/default.jpg',
                quantity: item.quantity
              }));
              setCart(transformedCart);
            }
          } catch (error) {
            console.error('Error fetching cart from API:', error);
            // Fallback to localStorage if API fails
            const savedCart = localStorage.getItem(`kc_cart_${user.id}`);
            if (savedCart) {
              setCart(JSON.parse(savedCart));
            }
          }
        } else {
          // For guest users, just use localStorage
          const savedCart = localStorage.getItem('kc_cart_guest');
          if (savedCart) {
            setCart(JSON.parse(savedCart));
          }
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        toast.error('Failed to load your cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        localStorage.setItem(`kc_cart_${user.id}`, JSON.stringify(cart));
      } else {
        localStorage.setItem('kc_cart_guest', JSON.stringify(cart));
      }
    }
  }, [cart, loading, user]);

  // Add item to cart
  const addItem = async (productId, quantity = 1) => {
    console.log('addItem called with:', { productId, quantity });
    console.log('user:', user);
    
    try {
      // Use either product ID or the entire product object
      const itemId = typeof productId === 'object' ? productId.id || productId._id : productId;
      console.log('Processed itemId:', itemId);
      
      if (user) {
        // If user is logged in, call the API
        console.log('Calling API with userId:', user.id, 'productId:', itemId);
        try {
          const response = await apiAddToCart(user.id, itemId, quantity);
          console.log('API response:', response);
        } catch (apiError) {
          console.error('API error:', apiError);
          throw apiError;
        }
      }
      
      // Update local cart state
      setCart(prevCart => {
        // Get product name for toast notification
        let productName = "Product";
        let productData = {};
        
        if (typeof productId === 'object') {
          productName = productId.name || "Product";
          productData = productId;
        }
        
        console.log('Updating cart state with:', { productId: itemId, productName });
        
        // Check if item already exists in cart
        const existingItemIndex = prevCart.findIndex(item => 
          item.id === itemId || item._id === itemId
        );
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + quantity
          };
          toast.success(`Updated quantity in your cart`);
          return updatedCart;
        } else {
          // Add new item if it doesn't exist
          let newItem;
          
          if (typeof productId === 'object') {
            // If a product object was passed
            newItem = { 
              id: productData.id || productData._id,
              _id: productData._id || productData.id,
              name: productData.name || "Product",
              price: productData.price || 0,
              image: productData.images && productData.images.length > 0 
                ? productData.images[0] 
                : '/images/default.jpg',
              quantity 
            };
          } else {
            // If just an ID was passed, we'll need a placeholder
            newItem = { 
              id: itemId, 
              _id: itemId,
              name: productName,
              price: 0,
              image: '/images/default.jpg',
              quantity 
            };
          }
          
          console.log('Adding new item to cart:', newItem);
          toast.success(`Added product to your cart`);
          return [...prevCart, newItem];
        }
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      if (user) {
        // If user is logged in, call the API
        await updateCartItem(user.id, productId, quantity);
      }
      
      setCart(prevCart => {
        // If quantity is 0 or less, remove item
        if (quantity <= 0) {
          return prevCart.filter(item => item.id !== productId);
        }
        
        // Otherwise update quantity
        return prevCart.map(item => 
          item.id === productId ? { ...item, quantity } : item
        );
      });
    } catch (error) {
      console.error('Error updating item quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      if (user) {
        // If user is logged in, call the API
        await removeFromCart(user.id, productId);
      }
      
      setCart(prevCart => {
        const itemToRemove = prevCart.find(item => item.id === productId);
        if (itemToRemove) {
          toast.success(`Removed ${itemToRemove.name} from your cart`);
        }
        return prevCart.filter(item => item.id !== productId);
      });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      if (user) {
        // If user is logged in, call the API
        await apiClearCart(user.id);
      }
      
      setCart([]);
      toast.success('Cart has been cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  // Get total items in cart
  const getItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate cart subtotal
  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Check if a product is in the cart
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId);
  };

  // Check if cart is empty
  const isEmpty = () => {
    return cart.length === 0;
  };

  // Context value
  const value = {
    cart,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getSubtotal,
    isInCart,
    isEmpty
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;