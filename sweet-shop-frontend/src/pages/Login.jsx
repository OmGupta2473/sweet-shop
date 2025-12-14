import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-10">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.28 }} className="w-full max-w-md card">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <div className="text-lg font-semibold">Welcome back</div>
          </div>
          <p className="text-sm text-slate-500">Sign in to continue to your dashboard</p>
        </div>
        {error && <div className="text-rose-500 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="input-base"/>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" className="input-base"/>
          <button disabled={loading} className="btn-primary">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-px bg-slate-200 flex-1" />
          <div className="text-sm text-slate-400">OR</div>
          <div className="h-px bg-slate-200 flex-1" />
        </div>
        <div className="mt-3">
          <GoogleSignIn className="w-full" onSuccess={()=>navigate('/dashboard')} />
        </div>
      </motion.div>
    </div>
  );
}
