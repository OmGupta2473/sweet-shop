import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl text-indigo-600">Sweet Shop</Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-gray-700">{user.name}</div>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm text-indigo-600">Admin</Link>
              )}
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-rose-500 text-white text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-indigo-600">Login</Link>
              <Link to="/register" className="text-sm text-indigo-600">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
