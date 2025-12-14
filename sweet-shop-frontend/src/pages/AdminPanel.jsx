import React, { useContext, useEffect, useState } from 'react';
import ProductImage from '../components/ProductImage';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [sweets, setSweets] = useState([]);
  const [form, setForm] = useState({ name: '', category: '', price: 0, quantity: 0, imageUrl: '' });
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const fetchSweets = async () => {
    const res = await api.get('/sweets');
    setSweets(res.data);
  };

  useEffect(() => { if (user) fetchSweets(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.imageUrl.trim()) {
      setFormError('Image URL is required');
      return;
    }
    try {
      if (editing) {
        await api.put(`/sweets/${editing}`, form);
        setEditing(null);
        setToast({ message: 'Sweet updated', type: 'success' });
      } else {
        await api.post('/sweets', form);
        setToast({ message: 'Sweet created', type: 'success' });
      }
      setForm({ name: '', category: '', price: 0, quantity: 0, imageUrl: '' });
      fetchSweets();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error', type: 'error' });
    }
  };

  const handleEdit = (s) => { setEditing(s._id); setForm({ name: s.name, category: s.category, price: s.price, quantity: s.quantity, imageUrl: s.imageUrl || '' }); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await api.delete(`/sweets/${id}`);
      setToast({ message: 'Sweet deleted', type: 'success' });
      fetchSweets();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Delete failed', type: 'error' });
    }
  };
  const handleRestock = async (id) => {
    let qty = window.prompt('Restock quantity');
    qty = Number(qty);
    if (!Number.isInteger(qty) || qty <= 0) {
      setToast({ message: 'Enter a valid positive integer', type: 'error' });
      return;
    }
    try {
      await api.post(`/sweets/${id}/restock`, { quantity: qty });
      setToast({ message: 'Restocked successfully', type: 'success' });
      fetchSweets();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Restock failed', type: 'error' });
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <div>
        <Navbar />
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">Admin - Manage Sweets</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 my-4">
              <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="Name" className="border p-2 rounded" />
              <input value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} placeholder="Category" className="border p-2 rounded" />
              <input value={form.price} onChange={(e)=>setForm({...form, price:Number(e.target.value)})} placeholder="Price" type="number" className="border p-2 rounded" onWheel={e => e.target.blur()} />
              <input value={form.quantity} onChange={(e)=>setForm({...form, quantity:Number(e.target.value)})} placeholder="Quantity" type="number" className="border p-2 rounded" onWheel={e => e.target.blur()} />
              <input value={form.imageUrl} onChange={e=>setForm({...form, imageUrl:e.target.value})} placeholder="Image URL (required)" className="border p-2 rounded" required />
              <div className="sm:col-span-5">
                <button className="py-2 px-4 rounded bg-indigo-600 text-white">{editing? 'Update' : 'Create'}</button>
                {editing && <button onClick={()=>{setEditing(null); setForm({ name:'', category:'', price:0, quantity:0, imageUrl:'' });}} type="button" className="ml-2 py-2 px-4 rounded bg-gray-200">Cancel</button>}
                {formError && <span className="ml-4 text-rose-600 font-medium">{formError}</span>}
              </div>
            </form>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sweets.map(s=> (
                <div className="bg-slate-50 rounded p-3 flex flex-col" key={s._id}>
                  <ProductImage src={s.imageUrl} alt={s.name} />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{s.name}</h3>
                      <div className="text-sm text-gray-500">{s.category}</div>
                    </div>
                    <div className="font-semibold">${s.price}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-600">Qty: {s.quantity}</div>
                    <div className="flex gap-2">
                      <button onClick={()=>handleEdit(s)} className="py-1 px-2 rounded bg-yellow-400">Edit</button>
                      <button onClick={()=>handleRestock(s._id)} className="py-1 px-2 rounded bg-green-400">Restock</button>
                      <button onClick={()=>handleDelete(s._id)} className="py-1 px-2 rounded bg-red-400">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </ProtectedRoute>
  );
}
