import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (sweetId, quantity = 1) => {
    await api.post('/cart/add', { sweetId, quantity });
    await fetchCart();
  };

  const removeFromCart = async (sweetId) => {
    await api.post('/cart/remove', { sweetId });
    await fetchCart();
  };

  const clearCart = async () => {
    await api.post('/cart/clear');
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
