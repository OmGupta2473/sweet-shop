import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleSignIn from '../components/GoogleSignIn';

export default function Register(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState(null);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mx-auto px-6 py-16 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">Register</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="border p-2 rounded"/>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded"/>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" className="border p-2 rounded"/>
          <button className="mt-2 py-2 rounded bg-indigo-600 text-white">Register</button>
        </form>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-px bg-slate-200 flex-1" />
          <div className="text-sm text-slate-400">OR</div>
          <div className="h-px bg-slate-200 flex-1" />
        </div>
        <div className="mt-3">
          <GoogleSignIn className="w-full" onSuccess={()=>navigate('/dashboard')} />
        </div>
      </div>
    </div>
  );
}
