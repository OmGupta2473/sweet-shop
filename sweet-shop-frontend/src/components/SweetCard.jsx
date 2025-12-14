import React from 'react';
import { motion } from 'framer-motion';
import ProductImage from './ProductImage';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductImage from './ProductImage';
import Toast from './Toast';
import api from '../api';

export default function SweetCard({ sweet, canPurchase }) {
  const [toast, setToast] = useState(null);
  const [quantity, setQuantity] = useState(sweet.quantity);
  const [pending, setPending] = useState(false);

  const handleBuyNow = async () => {
    if (quantity === 0 || pending) return;
    setPending(true);
    try {
      await api.post(`/sweets/${sweet._id}/purchase`);
      setQuantity(q => q - 1);
      setToast({ message: '✅ Thanks for purchasing! Your order has been placed.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Purchase failed', type: 'error' });
    } finally {
      setPending(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(16,24,40,0.12)' }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="card flex flex-col gap-3"
    >
      <ProductImage src={sweet.imageUrl} alt={sweet.name} />
      <div className="flex justify-between items-start">
        <div>
          <h3 className="brand-serif chocolate font-semibold text-lg">{sweet.name}</h3>
          <div className="text-sm text-muted text-sm text-slate-500">{sweet.category}</div>
        </div>
        <div className="text-xl brand-serif font-extrabold accent bg-amber-50/50 rounded-md px-3 py-1">${sweet.price}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">Qty: <span className="font-medium">{quantity}</span></div>
        {quantity === 0 ? (
          <div className="text-sm text-rose-500 font-semibold">Out of Stock</div>
        ) : quantity < 5 ? (
          <div className="text-sm text-amber-600 font-semibold">Low</div>
        ) : (
          <div className="text-sm text-slate-500">In Stock</div>
        )}
      </div>
      <button
        onClick={handleBuyNow}
        disabled={!canPurchase || quantity === 0 || pending}
        className={`mt-2 py-2 rounded-lg text-white ${quantity === 0 ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
      >
        {quantity === 0 ? 'Out of Stock' : pending ? 'Processing...' : 'Buy Now'}
      </button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </motion.div>
  );
}
