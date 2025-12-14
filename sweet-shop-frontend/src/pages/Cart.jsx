import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Toast from '../components/Toast';

export default function CartPage() {
  const { cart, fetchCart, removeFromCart, clearCart } = useCart();
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleBuyNow = async (item) => {
    try {
      await api.post(`/sweets/${item.sweet._id}/purchase`, { quantity: item.quantity });
      await removeFromCart(item.sweet._id);
      setToast({ message: '✅ Thanks for purchasing! Your order has been placed.', type: 'success' });
      fetchCart();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Purchase failed', type: 'error' });
    }
  };

  if (!cart || !cart.items.length) return <div className="container mx-auto px-6 py-8">Your cart is empty.</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
      {cart.items.map(item => (
        <div key={item.sweet._id} className="flex items-center gap-4 border-b py-3">
          <img src={item.sweet.imageUrl} alt={item.sweet.name} className="w-16 h-16 object-cover rounded" />
          <div className="flex-1">
            <div className="font-medium">{item.sweet.name}</div>
            <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
          </div>
          <button onClick={() => handleBuyNow(item)} className="btn-primary px-4 py-2 rounded">Buy Now</button>
          <button onClick={() => removeFromCart(item.sweet._id)} className="btn-ghost px-3 py-2 rounded">Remove</button>
        </div>
      ))}
      <button onClick={clearCart} className="mt-6 btn-ghost px-4 py-2 rounded">Clear Cart</button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
