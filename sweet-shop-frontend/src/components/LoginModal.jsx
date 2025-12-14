import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import GoogleSignIn from './GoogleSignIn';

export default function LoginModal({ isOpen, onClose, onSuccess }){
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if(!isOpen) return null;

  const submit = async (e)=>{
    e.preventDefault();
    setError(null);
    try{
      setLoading(true);
      await login(email, password);
      setLoading(false);
      if(onSuccess) onSuccess();
      onClose();
    }catch(err){
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.18 }} className="card w-full max-w-md z-50">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">Sign in to continue</h3>
          <p className="text-sm text-slate-500">Create an account or sign in to complete your purchase.</p>
        </div>
        {error && <div className="text-rose-500 mb-2">{error}</div>}
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="input-base" />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="input-base" />
          <div className="flex gap-2 items-center justify-end">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
        </form>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-px bg-slate-200 flex-1" />
          <div className="text-sm text-slate-400">OR</div>
          <div className="h-px bg-slate-200 flex-1" />
        </div>
        <div className="mt-3">
          <GoogleSignIn className="w-full" onSuccess={onSuccess} />
        </div>
      </motion.div>
    </div>
  );
}
