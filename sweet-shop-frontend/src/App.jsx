import React, { useState, useEffect, useRef, useMemo, createContext, useContext, useLayoutEffect } from 'react';
import Toast from './components/Toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';

// --- CONFIGURATION ---
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // Fallback for demo

// --- MOCK DATA & API SIMULATION ---
// Since we don't have a real backend in this environment, we simulate one.

const MOCK_SWEETS = [
  { _id: '1', name: 'Kaju Katli', category: 'Dry Fruit Sweets', price: 950, quantity: 25 },
  { _id: '2', name: 'Rasgulla', category: 'Bengali Sweets', price: 350, quantity: 50 },
  { _id: '3', name: 'Gulab Jamun', category: 'Traditional Sweets', price: 400, quantity: 40 },
  { _id: '4', name: 'Mysore Pak', category: 'Traditional Sweets', price: 600, quantity: 15 },
  { _id: '5', name: 'Motichoor Ladoo', category: 'Traditional Sweets', price: 450, quantity: 30 },
  { _id: '6', name: 'Milk Cake', category: 'Milk Sweets', price: 550, quantity: 20 },
  { _id: '7', name: 'Pista Barfi', category: 'Dry Fruit Sweets', price: 1100, quantity: 10 },
  { _id: '8', name: 'Gajar Halwa', category: 'Halwa & Fudge', price: 500, quantity: 0 }, // Sold out demo
  { _id: '9', name: 'Sugar-Free Anjeer Roll', category: 'Sugar-Free', price: 1200, quantity: 12 },
  { _id: '10', name: 'Chocolate Barfi', category: 'Chocolate Sweets', price: 650, quantity: 18 },
  { _id: '11', name: 'Rasmalai', category: 'Bengali Sweets', price: 450, quantity: 22 },
  { _id: '12', name: 'Soan Papdi', category: 'Traditional Sweets', price: 300, quantity: 60 },
];

// Simulated Axios Client
const api = {
  token: null,
  setToken: (token) => { api.token = token; },
  get: async (url) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (url === '/sweets') resolve({ data: [...MOCK_SWEETS] });
        else resolve({ data: [] });
      }, 600); // Simulate network latency
    });
  },
  post: async (url, body) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (url === '/auth/login') {
            // Mock Login
            resolve({ 
                data: { 
                    token: 'mock-jwt-token', 
                    user: { id: 'u1', name: 'Demo User', email: body.email, role: body.email.includes('admin') ? 'admin' : 'user' } 
                } 
            });
        } else if (url === '/auth/register') {
            resolve({ 
                data: { 
                    token: 'mock-jwt-token', 
                    user: { id: 'u2', name: body.name, email: body.email, role: 'user' } 
                } 
            });
        } else if (url.includes('/purchase')) {
            // FIX: Actually update the "database"
            const id = url.split('/')[2]; 
            const sweet = MOCK_SWEETS.find(s => s._id === id);
            if (sweet && sweet.quantity > 0) {
              sweet.quantity -= 1;
            }
            resolve({ data: { message: 'Purchase successful' }});
        } else if (url.includes('/restock')) {
            // FIX: Actually update the "database"
            const id = url.split('/')[2];
            const sweet = MOCK_SWEETS.find(s => s._id === id);
            if (sweet) {
              sweet.quantity += body.quantity;
            }
            resolve({ data: { message: 'Restocked' }});
        } else if (url === '/sweets') {
            // Mock Create
            const newSweet = { ...body, _id: Math.random().toString(), quantity: Number(body.quantity), price: Number(body.price) };
            MOCK_SWEETS.push(newSweet);
            resolve({ data: newSweet });
        } else {
            resolve({ data: {} });
        }
      }, 600);
    });
  },
  delete: async (url) => {
      return new Promise((resolve) => {
          setTimeout(() => {
              // FIX: Actually delete from "database"
              const id = url.split('/').pop();
              const index = MOCK_SWEETS.findIndex(s => s._id === id);
              if (index > -1) {
                  MOCK_SWEETS.splice(index, 1);
              }
              resolve({ data: { message: 'Deleted' }});
          }, 500);
      });
  }
};


// --- HELPER FUNCTIONS ---
function formatPrice(price) {
  return `₹${Math.round(price).toLocaleString('en-IN')}`;
}

// --- CONTEXTS ---

// 1. Theme Context (Dark/Light Mode)
export const ThemeContext = createContext(null);

export function useTheme() {
  return useContext(ThemeContext);
}

// 2. Auth Context
export const AuthContext = createContext(null);
export function useAuthContext() { return useContext(AuthContext); }

function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
      api.setToken(parsed.token);
    }
    setLoading(false);
  }, []);
  
  const saveAuth = (auth) => {
    setUser(auth.user);
    setToken(auth.token);
    localStorage.setItem('auth', JSON.stringify(auth));
    api.setToken(auth.token);
  };
  
  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem('auth');
  };
  
  return { user, token, loading, saveAuth, logout };
}

// --- COMPONENTS ---

// Google Sign-In Component (Visual Only for Demo)
export function GoogleSignInButton({ onSuccess, onError, className = '', showToast }) {
  const handleClick = () => {
    if (showToast) showToast('Google Sign-In is simulated in this environment.', 'success');
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`google-signin-btn ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2">
        <path fill="#4285F4" d="M24 9.5c3.54 0 6.35 1.53 7.81 2.82l5.76-5.76C34.38 3.8 29.67 1.5 24 1.5 14.82 1.5 6.77 7.27 3.12 15.09l6.93 5.38C12.19 14.64 17.62 9.5 24 9.5z"/>
        <path fill="#34A853" d="M46.47 24.53c0-1.45-.13-2.84-.37-4.18H24v8.06h12.65c-.53 2.93-2.14 5.41-4.56 7.07h-.01l7.02 5.46c4.11-3.8 6.47-9.4 6.47-15.41z"/>
        <path fill="#FBBC05" d="M10.05 28.14c-.66-1.97-1.05-4.07-1.05-6.24 0-2.17.39-4.27 1.05-6.24l-6.93-5.38C2.36 14.21 1.5 18 1.5 22c0 4 .86 7.79 2.62 11.03l6.93-5.38z"/>
        <path fill="#EA4335" d="M24 44.5c5.67 0 10.43-1.87 13.9-5.08l-7.02-5.46c-1.94 1.31-4.44 2.08-6.88 2.08-6.38 0-11.8-5.14-13.34-11.98l-6.93 5.38C6.77 36.73 14.82 44.5 24 44.5z"/>
      </svg>
      Continue with Google
    </button>
  );
}

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <motion.div
        key="loading-protected"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="loading-state-full"
      >
        <div className="spinner-large"></div>
      </motion.div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// --- AUTH PAGES (Inlined) ---

function LoginPage() {
  const { saveAuth } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await api.post('/auth/login', { email, password });
      saveAuth({ token: res.data.token, user: res.data.user });
      navigate(redirectPath);
    } catch (err) {
      setError('Invalid credentials');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-page-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-page-content"
        >
          <h1 className="auth-page-title">Welcome Back</h1>
          <p className="auth-page-subtitle">Sign in to continue to Sweet Shop</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <input name="email" type="email" placeholder="Email Address" required className="auth-input" defaultValue="user@example.com" />
            <input name="password" type="password" placeholder="Password" required className="auth-input" defaultValue="password" />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="divider"><span>OR</span></div>
          <GoogleSignInButton />
          
          <div className="auth-page-footer">
            Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
          </div>
          <div style={{marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center'}}>
            (Try <b>admin@example.com</b> for Admin view)
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const { saveAuth } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const res = await api.post('/auth/register', { name, email, password });
      saveAuth({ token: res.data.token, user: res.data.user });
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-page-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-page-content"
        >
          <h1 className="auth-page-title">Create Account</h1>
          <p className="auth-page-subtitle">Join us for premium sweets</p>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <input name="name" type="text" placeholder="Full Name" required className="auth-input" />
            <input name="email" type="email" placeholder="Email Address" required className="auth-input" />
            <input name="password" type="password" placeholder="Password" required className="auth-input" />
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="divider"><span>OR</span></div>
          <GoogleSignInButton />
          
          <div className="auth-page-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// --- MAIN APPLICATION ENTRY ---

export default function App() {
  const authState = useAuth();
  
  // Theme State Logic
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme to body instantly
  useLayoutEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-mode' : 'light-mode';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthContext.Provider value={authState}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <GlobalStyles />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><MainApp /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><MainApp /></ProtectedRoute>} />
          <Route path="/" element={<MainApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// --- MAIN LOGIC CONTAINER ---

function MainApp() {
  const { user, loading, logout } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState('home');
  
  // Data State
  const [allSweets, setAllSweets] = useState([]); // Master list
  const [swLoading, setSwLoading] = useState(false);
  const [swError, setSwError] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  
  // UI State
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const categoryDropdownRef = useRef(null);
  const priceDropdownRef = useRef(null);
  
  const allCategories = [
    'Traditional Sweets',
    'Milk Sweets',
    'Dry Fruit Sweets',
    'Bengali Sweets',
    'Halwa & Fudge',
    'Festival Specials',
    'Sugar-Free',
    'Chocolate Sweets',
    'Other'
  ];
  
  const categories = ['All Categories', ...allCategories];

  // Routing Logic
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') {
      setPage('dashboard');
    } else if (path === '/admin') {
      setPage('admin');
    } else if (path === '/') {
      setPage('home');
    }
    // Fetch data whenever we enter a main view
    fetchSweets();
  }, [location.pathname]);
  
  // Outside Click Logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
        setShowPriceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- CORE LOGIC: DATA FETCHING ---
  async function fetchSweets() {
    setSwLoading(true);
    setSwError(null);
    try {
      const res = await api.get('/sweets'); 
      setAllSweets(res.data);
    } catch (err) {
      setSwError('Failed to load sweets');
    }
    setSwLoading(false);
  }

  // --- CORE LOGIC: INSTANT FILTERING (Derived State) ---
  const filteredSweets = useMemo(() => {
    return allSweets.filter(sweet => {
      // 1. Search Query (Case insensitive, matched against name OR category text)
      const cleanQuery = searchQuery.trim().toLowerCase();
      const nameMatch = sweet.name.toLowerCase().includes(cleanQuery);
      const catTextMatch = sweet.category.toLowerCase().includes(cleanQuery);
      const searchMatch = cleanQuery === '' || nameMatch || catTextMatch;

      // 2. Category Dropdown
      const categoryMatch = selectedCategory === '' || sweet.category === selectedCategory;

      // 3. Price Range
      const priceMatch = sweet.price >= priceRange[0] && sweet.price <= priceRange[1];

      // COMBINED RULE: ALL MUST BE TRUE
      return searchMatch && categoryMatch && priceMatch;
    });
  }, [allSweets, searchQuery, selectedCategory, priceRange]);

  // --- HANDLERS ---

  function handleResetFilters() {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange([0, 2000]);
  }

  // --- Toast State ---
  const [toast, setToast] = useState({ message: '', type: 'success' });

  async function handlePurchase(sweetId) {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    try {
      await api.post(`/sweets/${sweetId}/purchase`);
      setAllSweets(prev => prev.map(s => s._id === sweetId ? {...s, quantity: Math.max(0, s.quantity - 1)} : s));
      setToast({ message: '✅ Order placed successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Purchase failed', type: 'error' });
    }
  }

  async function handleRestock(sweetId, qty) {
    if (!qty || isNaN(qty) || Number(qty) <= 0) {
      setToast({ message: 'Invalid restock quantity', type: 'error' });
      return;
    }
    try {
      await api.post(`/sweets/${sweetId}/restock`, { quantity: Number(qty) });
      setAllSweets(prev => prev.map(s => s._id === sweetId ? {...s, quantity: s.quantity + Number(qty)} : s));
      setToast({ message: 'Stock updated', type: 'success' });
    } catch (err) {
      setToast({ message: 'Restock failed', type: 'error' });
    }
  }

  async function handleDelete(sweetId) {
    // Show a UI confirmation instead of window.confirm
    if (!window.confirm('Are you sure you want to delete this item?')) return; // Replace with modal for production
    try {
      await api.delete(`/sweets/${sweetId}`);
      setAllSweets(prev => prev.filter(s => s._id !== sweetId));
      setToast({ message: 'Sweet deleted', type: 'success' });
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  }

  async function handleCreateSweet(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSweetData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: Number(formData.get('price')),
        quantity: Number(formData.get('quantity')),
        imageUrl: formData.get('imageUrl'),
    };

    if (!newSweetData.imageUrl) {
      setToast({ message: 'Image URL is required', type: 'error' });
      return;
    }
    try {
      const res = await api.post('/sweets', newSweetData);
      setAllSweets(prev => [...prev, res.data]);
      e.target.reset();
      setToast({ message: 'Sweet created', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to create sweet', type: 'error' });
    }
  }
  // --- Toast UI ---
  // Place this at the root of your app render
  // <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

  // --- RENDERERS ---

  function renderNav() {
    return (
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="navbar glass-navbar"
      >
        <div className="navbar-container">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="navbar-brand"
          >
            <span className="brand-icon">🍬</span>
            <span className="brand-text">Sweet Shop</span>
          </motion.button>

          <div className="navbar-links">
            <button
              className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button
              className={`nav-link ${location.pathname === '/dashboard' ? 'nav-link-active' : ''}`}
              onClick={() => user ? navigate('/dashboard') : navigate('/login')}
            >
              Shop
            </button>
            {user && user.role === 'admin' && (
              <button
                className={`nav-link ${location.pathname === '/admin' ? 'nav-link-active' : ''}`}
                onClick={() => navigate('/admin')}
              >
                Admin
              </button>
            )}

            {/* THEME TOGGLE BUTTON */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {user ? (
              <>
                <span className="user-name">{user.name}</span>
                <button onClick={() => { logout(); navigate('/'); }} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="auth-btn">
                  Sign In
                </button>
                <button onClick={() => navigate('/register')} className="auth-btn-primary premium-btn">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </motion.nav>
    );
  }

  function renderHome() {
    const featuredSweets = allSweets.slice(0, 4);
    
    return (
      <motion.div
        key="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="home-page"
      >
        <section className="hero-section">
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hero-badge"
            >
              <span className="badge-icon">⭐</span>
              <span>Premium Indian Sweets & Confectionery</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hero-title"
            >
              Handcrafted Sweets
              <br />
              <span className="hero-subtitle glow-text">Made with Love</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hero-description"
            >
              Discover our premium collection of artisanal Indian confections, 
              crafted using traditional recipes with a modern twist. Each sweet is made fresh daily with the finest ingredients.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="hero-meta"
            >
              <div className="meta-item">
                <span className="meta-icon">🚚</span>
                <span>Free Delivery on Orders Above ₹999</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">⭐</span>
                <span>4.8/5 Rated by 10K+ Customers</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📦</span>
                <span>Fresh Daily • Pan India Delivery</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="hero-actions"
            >
              {user ? (
                <button className="cta-button premium-btn" onClick={() => navigate('/dashboard')}>
                  Browse Collection
                </button>
              ) : (
                <>
                  <button className="cta-button premium-btn" onClick={() => navigate('/register')}>
                    Get Started
                  </button>
                  <button className="cta-button-secondary" onClick={() => navigate('/login')}>
                    Sign In
                  </button>
                </>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-visual"
          >
            <div className="hero-grid">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.5 + i * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="hero-card"
                >
                  <div className="hero-card-gradient"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {featuredSweets.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="featured-section"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="section-title"
            >
              Featured Sweets
            </motion.h2>
            <div className="sweets-grid">
              {featuredSweets.map((sweet, index) => (
                <motion.div
                  key={sweet._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -12, transition: { duration: 0.3 } }}
                  className="sweet-card premium-card"
                >
                  <div className="sweet-card-image-container">
                    <motion.div
                      className="sweet-card-image"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="sweet-card-header">
                    <h3 className="sweet-name">{sweet.name}</h3>
                    <span className="sweet-category">{sweet.category}</span>
                  </div>
                  <div className="sweet-card-body">
                    <div className="sweet-price">{formatPrice(sweet.price)}</div>
                    <div className="sweet-stock">{sweet.quantity > 0 ? 'Available Today' : 'Out of Stock'}</div>
                  </div>
                  <button
                    className="sweet-buy-btn premium-btn"
                    disabled={sweet.quantity <= 0}
                    onClick={() => user ? handlePurchase(sweet._id) : navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                  >
                    {sweet.quantity <= 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </motion.div>
    );
  }

  function renderDashboard() {
    return (
      <motion.div
        key="dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="dashboard-page"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1 className="page-title">Our Collection</h1>
          <p className="page-subtitle">Browse and purchase from our premium selection</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="search-section glass-filter-bar"
        >
          {/* SEARCH & FILTER UI */}
          <div className="search-container">
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="search-input glass-input"
            />
            
            {/* Category Dropdown */}
            <div className="dropdown-container" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowPriceDropdown(false);
                }}
                className="dropdown-trigger glass-input"
              >
                <span>{selectedCategory || 'All Categories'}</span>
                <motion.svg
                  animate={{ rotate: showCategoryDropdown ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              </button>
              
              <AnimatePresence>
                {showCategoryDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="dropdown-menu glass-dropdown"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat === 'All Categories' ? '' : cat);
                          setShowCategoryDropdown(false);
                        }}
                        className={`dropdown-item ${selectedCategory === (cat === 'All Categories' ? '' : cat) ? 'selected' : ''}`}
                      >
                        {selectedCategory === (cat === 'All Categories' ? '' : cat) && (
                          <span className="check-mark">✔</span>
                        )}
                        {cat}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Price Filter Dropdown */}
            <div className="dropdown-container" ref={priceDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowPriceDropdown(!showPriceDropdown);
                  setShowCategoryDropdown(false);
                }}
                className="dropdown-trigger glass-input"
              >
                <span>Price {priceRange[0] > 0 || priceRange[1] < 2000 ? `(₹${priceRange[0]} - ₹${priceRange[1]})` : ''}</span>
                <motion.svg
                  animate={{ rotate: showPriceDropdown ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </motion.svg>
              </button>
              
              <AnimatePresence>
                {showPriceDropdown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="dropdown-menu glass-dropdown price-dropdown"
                  >
                    <div className="price-filter-content">
                      <div className="price-range-display">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                      <div className="price-slider-container">
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="50"
                          value={priceRange[0]}
                          onChange={(e) => {
                            const newMin = Math.min(Number(e.target.value), priceRange[1]);
                            setPriceRange([newMin, priceRange[1]]);
                          }}
                          className="price-slider"
                        />
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="50"
                          value={priceRange[1]}
                          onChange={(e) => {
                            const newMax = Math.max(Number(e.target.value), priceRange[0]);
                            setPriceRange([priceRange[0], newMax]);
                          }}
                          className="price-slider"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              type="button"
              onClick={handleResetFilters}
              className="search-btn-secondary"
            >
              Reset
            </button>
          </div>
        </motion.div>

        {swLoading && allSweets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="loading-state"
          >
            <div className="spinner-large"></div>
            <p>Loading sweets...</p>
          </motion.div>
        ) : swError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="error-state"
          >
            <p>{swError}</p>
            <button onClick={fetchSweets} className="retry-btn premium-btn">Try Again</button>
          </motion.div>
        ) : filteredSweets.length === 0 ? (
          <div className="empty-state">
            <p>No sweets found matching your criteria</p>
            <button onClick={handleResetFilters} className="auth-link" style={{fontSize: '1rem', marginTop: '1rem'}}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="sweets-grid-full">
            {filteredSweets.map((sweet, index) => (
              <motion.div
                key={sweet._id}
                layout // Enable layout animations for filtering
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ y: -12, transition: { duration: 0.3 } }}
                className="sweet-card-full premium-card"
              >
                <div className="sweet-card-image-container">
                  <motion.div
                    className="sweet-card-image"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="sweet-card-header">
                  <h3 className="sweet-name">{sweet.name}</h3>
                  <span className="sweet-category">{sweet.category}</span>
                </div>
                <div className="sweet-card-body">
                  <div className="sweet-price">{formatPrice(sweet.price)}</div>
                  {user && user.role === 'admin' && (
                    <div className="sweet-stock">Available: {sweet.quantity}</div>
                  )}
                  {(!user || user.role !== 'admin') && (
                    <div className="sweet-stock">{sweet.quantity > 0 ? 'Available Today' : 'Out of Stock'}</div>
                  )}
                </div>
                <div className="sweet-card-actions">
                  <button
                    className="sweet-buy-btn premium-btn"
                    disabled={sweet.quantity <= 0}
                    onClick={() => handlePurchase(sweet._id)}
                  >
                    {sweet.quantity <= 0 ? 'Sold Out' : 'Buy Now'}
                  </button>
                  {user && user.role === 'admin' && (
                    <div className="admin-actions">
                      <button
                        className="admin-btn"
                        onClick={() => handleRestock(sweet._id)}
                      >
                        Restock
                      </button>
                      <button
                        className="admin-btn-delete"
                        onClick={() => handleDelete(sweet._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  function renderAdmin() {
    return (
      <motion.div
        key="admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="admin-page"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage your inventory</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="admin-form-section"
        >
          <h2 className="section-title">Add New Sweet</h2>
          <form onSubmit={handleCreateSweet} className="admin-form">
            <input name="name" placeholder="Sweet Name" required className="admin-input" />
            <select name="category" required className="admin-input admin-select">
              <option value="">Select Category</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input name="price" placeholder="Price (₹)" type="number" step="0.01" required className="admin-input" />
            <input name="quantity" placeholder="Initial Quantity" type="number" required className="admin-input" />
            <button type="submit" className="admin-submit-btn premium-btn">Add Sweet</button>
          </form>
        </motion.div>

        {renderDashboard()}
      </motion.div>
    );
  }

  return (
    <div className="app-container">
      {renderNav()}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="loading-state-full"
            >
              <div className="spinner-large"></div>
            </motion.div>
          ) : (
            <>
              {page === 'home' && renderHome()}
              {page === 'dashboard' && renderDashboard()}
              {page === 'admin' && renderAdmin()}
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- GLOBAL STYLES ---

function GlobalStyles() {
  return (
    <style>{`
        /* --- THEME VARIABLES --- */
        
        body.light-mode {
          --primary: #ec4899;
          --primary-dark: #db2777;
          --secondary: #f59e0b;
          --bg-gradient: linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fed7aa 100%);
          --bg: #fef3c7;
          --bg-light: #fef9e7;
          --text: #1f2937;
          --text-light: #6b7280;
          --border: #e5e7eb;
          --card-bg: #ffffff;
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.3);
          --input-bg: rgba(255, 255, 255, 0.5);
          --dropdown-bg: rgba(255, 255, 255, 0.85);
          --success: #10b981;
          --error: #ef4444;
          --white: #ffffff;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        body.dark-mode {
          --primary: #f472b6; /* Lighter pink for dark mode contrast */
          --primary-dark: #ec4899;
          --secondary: #fbbf24;
          --bg-gradient: linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%);
          --bg: #111827;
          --bg-light: #374151;
          --text: #f9fafb;
          --text-light: #9ca3af;
          --border: #374151;
          --card-bg: #1f2937;
          --glass-bg: rgba(31, 41, 55, 0.8);
          --glass-border: rgba(255, 255, 255, 0.1);
          --input-bg: rgba(55, 65, 81, 0.6);
          --dropdown-bg: #1f2937;
          --success: #34d399;
          --error: #f87171;
          --white: #ffffff; /* Text inside primary buttons stays white */
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
        }
        
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Inter', sans-serif; background: var(--bg); color: var(--text); transition: background-color 0.3s, color 0.3s; }
        
        .app-container { min-height: 100vh; background: var(--bg-gradient); transition: background 0.3s; }
        
        /* Premium Button with Ripple Effect */
        .premium-btn {
          position: relative;
          overflow: hidden;
        }
        .premium-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        .premium-btn:hover::before {
          width: 300px;
          height: 300px;
        }
        .premium-btn:hover {
          box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4);
        }
        
        /* Glow Text Effect */
        .glow-text {
          position: relative;
          text-shadow: 0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3);
        }
        
        /* Glassmorphism Styles - Updated for Dark Mode */
        .glass-navbar {
          background: var(--glass-bg);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--glass-border);
          box-shadow: var(--shadow);
        }
        
        .glass-filter-bar {
          background: var(--glass-bg);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow);
        }
        
        .glass-input {
          background: var(--input-bg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          color: var(--text);
        }
        
        .glass-dropdown {
          background: var(--dropdown-bg);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-lg);
        }
        
        .navbar { position: sticky; top: 0; z-index: 40; }
        .navbar-container { max-width: 1280px; margin: 0 auto; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        .navbar-brand { display: flex; align-items: center; gap: 0.75rem; background: none; border: none; cursor: pointer; font-size: 1.5rem; font-weight: 700; color: var(--primary); }
        .brand-icon { font-size: 2rem; }
        .brand-text { background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .navbar-links { display: flex; align-items: center; gap: 1.5rem; }
        .nav-link { background: none; border: none; color: var(--text); font-size: 1rem; font-weight: 500; cursor: pointer; padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; position: relative; }
        .nav-link::after { content: ''; position: absolute; bottom: 0; left: 50%; width: 0; height: 2px; background: var(--primary); transform: translateX(-50%); transition: width 0.3s; }
        .nav-link:hover::after { width: 80%; }
        .nav-link:hover { color: var(--primary); }
        .nav-link-active { color: var(--primary); }
        .nav-link-active::after { width: 80%; }
        .user-name { color: var(--text-light); font-size: 0.9rem; }
        
        /* Theme Toggle Button */
        .theme-toggle-btn { background: var(--bg-light); border: 1px solid var(--border); color: var(--text); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 1.2rem; }
        .theme-toggle-btn:hover { transform: rotate(15deg) scale(1.1); border-color: var(--primary); }

        .auth-btn { background: none; border: 1px solid var(--border); color: var(--text); padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .auth-btn:hover { background: var(--bg-light); }
        .auth-btn-primary { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow); }
        .auth-btn-primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-lg); }
        .logout-btn { background: var(--error); color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .logout-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        
        .main-content { max-width: 1280px; margin: 0 auto; padding: 2rem; }
        
        .home-page { }
        .hero-section { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; padding: 4rem 0; }
        @media (max-width: 768px) { .hero-section { grid-template-columns: 1fr; } }
        
        .hero-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--card-bg); padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; color: var(--primary); box-shadow: var(--shadow); margin-bottom: 1.5rem; }
        .badge-icon { font-size: 1rem; }
        
        .hero-title { font-size: 3.5rem; font-weight: 800; line-height: 1.2; color: var(--text); margin-bottom: 1.5rem; }
        .hero-subtitle { background: linear-gradient(135deg, var(--primary), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-description { font-size: 1.25rem; color: var(--text-light); margin-bottom: 2rem; line-height: 1.6; }
        
        .hero-meta { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem; }
        .meta-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; color: var(--text-light); }
        .meta-icon { font-size: 1.25rem; }
        
        .hero-actions { display: flex; gap: 1rem; }
        .cta-button { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; padding: 1rem 2rem; border-radius: 0.75rem; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: var(--shadow-lg); position: relative; overflow: hidden; }
        .cta-button:hover { transform: translateY(-2px); }
        .cta-button-secondary { background: var(--card-bg); color: var(--primary); border: 2px solid var(--primary); padding: 1rem 2rem; border-radius: 0.75rem; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .cta-button-secondary:hover { background: var(--bg-light); transform: translateY(-1px); }
        
        .hero-visual { }
        .hero-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .hero-card { aspect-ratio: 1; border-radius: 1rem; box-shadow: var(--shadow-lg); position: relative; overflow: hidden; cursor: pointer; }
        .hero-card-gradient { width: 100%; height: 100%; background: linear-gradient(135deg, #fce7f3, #fef3c7, #fed7aa); }
        
        .featured-section { margin-top: 6rem; }
        .section-title { font-size: 2.5rem; font-weight: 700; color: var(--text); margin-bottom: 3rem; text-align: center; }
        
        .sweets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
        .sweets-grid-full { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
        
        .premium-card { background: var(--card-bg); border-radius: 1.25rem; padding: 0; box-shadow: var(--shadow); transition: all 0.3s; overflow: hidden; position: relative; z-index: 1; }
        .premium-card:hover { box-shadow: var(--shadow-xl); transform: translateY(-5px); }
        
        .sweet-card, .sweet-card-full { background: var(--card-bg); border-radius: 1.25rem; padding: 0; box-shadow: var(--shadow); transition: all 0.3s; overflow: hidden; position: relative; z-index: 1; max-width: 100%; }
        
        .sweet-card-image-container { width: 100%; aspect-ratio: 4/3; position: relative; overflow: hidden; }
        .sweet-card-image { width: 100%; height: 100%; background: linear-gradient(135deg, #fce7f3, #fef3c7, #fed7aa); }
        
        .sweet-card-header { padding: 1rem 1rem 0.5rem; }
        .sweet-name { font-size: 1.25rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; line-height: 1.3; }
        .sweet-category { font-size: 0.75rem; color: var(--text-light); background: var(--bg-light); padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; }
        .sweet-card-body { padding: 0 1rem 0.75rem; }
        .sweet-price { font-size: 1.5rem; font-weight: 800; color: var(--primary); margin-bottom: 0.25rem; }
        .sweet-stock { font-size: 0.75rem; color: var(--text-light); }
        .sweet-card-actions { padding: 0 1rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .sweet-buy-btn { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; width: 100%; position: relative; overflow: hidden; }
        .sweet-buy-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .sweet-buy-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .admin-actions { display: flex; gap: 0.5rem; }
        .admin-btn { background: var(--bg-light); color: var(--text); border: 1px solid var(--border); padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
        .admin-btn:hover { background: var(--bg); }
        .admin-btn-delete { background: var(--error); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
        .admin-btn-delete:hover { opacity: 0.9; }
        
        .dashboard-page { position: relative; }
        .page-header { margin-bottom: 3rem; }
        .page-title { font-size: 3rem; font-weight: 800; color: var(--text); margin-bottom: 0.5rem; }
        .page-subtitle { font-size: 1.25rem; color: var(--text-light); }
        .search-section { border-radius: 1.25rem; padding: 2rem; margin-bottom: 2rem; position: relative; z-index: 100; }
        
        /* New Search Layout */
        .search-container { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
        @media (max-width: 768px) { .search-container { flex-direction: column; align-items: stretch; } }
        
        .search-input { flex: 2; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 1rem; transition: all 0.3s; min-width: 200px; }
        .search-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.15), 0 4px 12px rgba(236, 72, 153, 0.1); }
        
        /* Dropdown Styles */
        .dropdown-container { position: relative; z-index: 1000; flex: 1; min-width: 180px; }
        .dropdown-trigger { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; width: 100%; border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 1rem; cursor: pointer; transition: all 0.3s; color: var(--text); }
        .dropdown-trigger:hover { background: var(--glass-bg); }
        .dropdown-trigger svg { flex-shrink: 0; }
        
        .dropdown-menu { position: absolute; top: calc(100% + 0.5rem); left: 0; right: 0; z-index: 1000; border-radius: 0.75rem; padding: 0.5rem; min-width: 200px; max-height: 300px; overflow-y: auto; }
        .dropdown-item { display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.75rem 1rem; border-radius: 0.5rem; border: none; background: transparent; text-align: left; font-size: 0.95rem; color: var(--text); cursor: pointer; transition: all 0.2s; }
        .dropdown-item:hover { background: rgba(236, 72, 153, 0.1); }
        .dropdown-item.selected { background: rgba(236, 72, 153, 0.15); color: var(--primary); font-weight: 600; }
        .check-mark { color: var(--primary); font-weight: 700; }
        
        /* Price Filter Styles */
        .price-dropdown { min-width: 280px; }
        .price-filter-content { padding: 0.5rem; }
        .price-range-display { display: flex; justify-content: space-between; margin-bottom: 1rem; font-weight: 600; color: var(--text); font-size: 0.95rem; }
        .price-slider-container { position: relative; margin-bottom: 1rem; }
        .price-slider { width: 100%; height: 6px; -webkit-appearance: none; appearance: none; background: linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(245, 158, 11, 0.3)); border-radius: 3px; outline: none; margin: 0.5rem 0; }
        .price-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4); transition: all 0.2s; }
        .price-slider::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 4px 12px rgba(236, 72, 153, 0.6); }
        
        .search-btn-secondary { background: var(--bg-light); color: var(--text); border: 1px solid var(--border); padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .search-btn-secondary:hover { background: var(--bg); }
        
        .loading-state, .loading-state-full { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; gap: 1rem; }
        .loading-state-full { min-height: 60vh; }
        .spinner, .spinner-large { border: 3px solid var(--bg-light); border-top: 3px solid var(--primary); border-radius: 50%; width: 24px; height: 24px; animation: spin 0.8s linear infinite; }
        .spinner-large { width: 48px; height: 48px; border-width: 4px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .error-state, .empty-state, .access-denied { text-align: center; padding: 4rem 2rem; color: var(--text-light); }
        .retry-btn { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; margin-top: 1rem; position: relative; overflow: hidden; }
        
        .admin-page { }
        .admin-form-section { background: var(--card-bg); border-radius: 1.25rem; padding: 2rem; box-shadow: var(--shadow); margin-bottom: 3rem; }
        .admin-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .admin-input, .admin-select { border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.75rem 1rem; font-size: 1rem; transition: all 0.2s; background: var(--input-bg); color: var(--text); }
        .admin-input:focus, .admin-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1); }
        .admin-select { cursor: pointer; }
        .admin-submit-btn { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s; grid-column: 1 / -1; position: relative; overflow: hidden; }
        .admin-submit-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow); }
        
        .auth-form { display: flex; flex-direction: column; gap: 1rem; }
        .auth-input { border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.875rem 1rem; font-size: 1rem; transition: all 0.2s; background: var(--input-bg); color: var(--text); }
        .auth-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.1); }
        .error-message { background: rgba(239, 68, 68, 0.1); color: var(--error); padding: 0.75rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; }
        .auth-submit-btn { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; padding: 0.875rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-top: 0.5rem; position: relative; overflow: hidden; }
        .auth-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-lg); }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
        .divider span { color: var(--text-light); font-size: 0.875rem; }
        .google-signin-btn { background: var(--card-bg); border: 1px solid var(--border); color: var(--text); padding: 0.875rem 1.5rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; width: 100%; }
        .google-signin-btn:hover { background: var(--bg-light); border-color: var(--primary); }
        .google-signin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-gradient); padding: 2rem; }
        .auth-page-container { width: 100%; max-width: 420px; }
        .auth-page-content { background: var(--card-bg); border-radius: 1.5rem; padding: 2.5rem; box-shadow: var(--shadow-xl); }
        .auth-page-title { font-size: 2rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; text-align: center; }
        .auth-page-subtitle { font-size: 0.95rem; color: var(--text-light); margin-bottom: 2rem; text-align: center; }
        .auth-page-footer { margin-top: 1.5rem; text-align: center; font-size: 0.9rem; color: var(--text-light); }
        .auth-link { background: none; border: none; color: var(--primary); font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0; }
        .auth-link:hover { color: var(--primary-dark); }
        
        @media (max-width: 768px) {
          .navbar-container { padding: 1rem; }
          .navbar-links { gap: 0.75rem; flex-wrap: wrap; }
          .main-content { padding: 1rem; }
          .hero-title { font-size: 2.5rem; }
          .hero-meta { font-size: 0.875rem; }
          .page-title { font-size: 2rem; }
          .section-title { font-size: 2rem; }
          .admin-form { grid-template-columns: 1fr; }
          .sweets-grid, .sweets-grid-full { grid-template-columns: 1fr; }
        }
      `}</style>
  );
}