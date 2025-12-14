import React, { useContext, useEffect, useState } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import SweetCard from '../components/SweetCard';
import LoginModal from '../components/LoginModal';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchSweets = async (params = {}) =>{
    setLoading(true);
    try{
      const res = await api.get('/sweets', { params });
      setSweets(res.data);
    }catch(err){
      setError('Failed to fetch sweets');
    }finally{setLoading(false)}
  }

  useEffect(()=>{
    fetchSweets();
  },[user]);

  const handlePurchase = async (sweet) => {
    if (!user) {
      setPending(sweet);
      setLoginOpen(true);
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
      setPending(sweet);
      setLoginOpen(true);
      return;
    }
    try {
      await addToCart(sweet._id, 1);
      setToast({ message: 'Added to cart', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Add to cart failed', type: 'error' });
    }
  };

  const resumePurchase = async () => {
    if (!pending) return;
    try {
      await api.post(`/sweets/${pending._id}/purchase`);
      setPending(null);
      fetchSweets();
      setToast({ message: '✅ Thanks for purchasing! Your order has been placed.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Purchase failed', type: 'error' });
    }
  };

  const handleSearch = async (e)=>{
    e.preventDefault();
    const params = {};
    if(query) params.name = query;
    if(category) params.category = category;
    if(minPrice) params.minPrice = minPrice;
    if(maxPrice) params.maxPrice = maxPrice;
    const res = await api.get('/sweets/search', { params });
    setSweets(res.data);
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="rounded-lg bg-white p-6 shadow">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name" className="border p-2 rounded w-full" /></div>
            <div className="min-w-[150px]"><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="border p-2 rounded w-full" /></div>
            <div className="min-w-[100px]"><input value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="Min" type="number" className="border p-2 rounded w-full" /></div>
            <div className="min-w-[100px]"><input value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Max" type="number" className="border p-2 rounded w-full" /></div>
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">Search</button>
            <button type="button" onClick={()=>{setQuery(''); setCategory(''); setMinPrice(''); setMaxPrice(''); fetchSweets();}} className="px-4 py-2 rounded bg-gray-200">Reset</button>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {loading ? <div>Loading...</div> : sweets.map(s=> (
            <SweetCard key={s._id} sweet={s} canPurchase={!!user} />
          ))}
        </div>
        <LoginModal isOpen={loginOpen} onClose={()=>setLoginOpen(false)} onSuccess={resumePurchase} />
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}

