import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { theme, setTheme } = useContext(ThemeContext);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return (
    <header className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-gray-950 shadow-sm border-b">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-primary h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold shadow">S</div>
          <div className="font-semibold text-lg text-slate-800">Sweet Shop</div>
        </Link>
        <nav className="flex items-center gap-4">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="px-2 py-1 rounded text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 mr-2">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <Link to="/" className="text-sm text-slate-600">Home</Link>
          {user && <Link to="/dashboard" className="text-sm text-slate-600">Dashboard</Link>}
          {user ? (
            <>
              <div className="hidden md:block text-sm text-slate-700">{user.name}</div>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm text-primary font-medium">Admin</Link>
              )}
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-rose-500 text-white text-sm hover:opacity-95">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-primary font-medium">Login</Link>
              <Link to="/register" className="text-sm text-primary font-medium">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
