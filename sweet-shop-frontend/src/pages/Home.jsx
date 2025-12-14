import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import SweetCard from '../components/SweetCard';
import GoogleSignIn from '../components/GoogleSignIn';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchSweets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sweets');
      setSweets(res.data);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => { fetchSweets(); }, []);

  const handlePurchase = async (sweet) => {
    if (!user) {
      setToast({ message: 'Please login to purchase', type: 'error' });
      return;
    }
    try {
      await api.post(`/sweets/${sweet._id}/purchase`);
      fetchSweets();
      setToast({ message: '✅ Thanks for purchasing! Your order has been placed.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Purchase failed', type: 'error' });
    }
  };

  const handleAddToCart = async (sweet) => {
    if (!user) {
      setToast({ message: 'Please login to add to cart', type: 'error' });
      return;
    }
    try {
      await addToCart(sweet._id, 1);
      setToast({ message: 'Added to cart', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Add to cart failed', type: 'error' });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="brand-serif text-4xl md:text-5xl font-bold chocolate">Artisanal sweets crafted with love</h1>
            <p className="mt-4 text-muted">Premium, small-batch confections inspired by hand-made recipes. Browse our selection and sign in to purchase.</p>
            <div className="mt-6 flex gap-3 items-center">
              <Link to="/login" className="btn-primary">Login</Link>
              <Link to="/register" className="btn-ghost">Sign up</Link>
              <div className="ml-2"><GoogleSignIn /></div>
            </div>
          </motion.div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? <div>Loading...</div> : sweets.slice(0, 4).map(s => (
                <SweetCard key={s._id} sweet={s} canPurchase={!!user} />
              ))}
            </div>
          </div>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
