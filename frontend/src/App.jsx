import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext, useContext, useCallback, Suspense, lazy } from 'react';
import CreateShipment from './pages/CreateShipment';
import TrackShipment from './pages/TrackShipment';
import OwnerDashboard from './pages/OwnerDashboard';

// Lazy-load heavy QR scanner (html5-qrcode ~400KB) so it only loads when needed
const ScanQR = lazy(() => import('./pages/ScanQR'));

// --- Toast System ---
const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const ToastContainer = ({ toasts, onDismiss }) => (
  <div style={{
    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    zIndex: 9999, maxWidth: '360px',
  }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        padding: '1rem 1.25rem',
        borderRadius: '0.75rem',
        background: t.type === 'error' ? 'rgba(239,68,68,0.95)' : t.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(30,41,59,0.97)',
        color: 'white', fontSize: '0.9rem', fontWeight: '500',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        borderLeft: `4px solid ${t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#3b82f6'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
        animation: 'slideIn 0.3s ease',
        cursor: 'pointer',
      }} onClick={() => onDismiss(t.id)}>
        <span>{t.message}</span>
        <span style={{ opacity: 0.7, flexShrink: 0 }}>✕</span>
      </div>
    ))}
  </div>
);

// --- Top Nav ---
const NavBar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '64px',
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>♻️</span>
        <span style={{ fontWeight: '700', fontSize: '1.2rem', background: 'linear-gradient(90deg,#3b82f6,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TrashTrace</span>
      </Link>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/create', label: 'Create' },
          { path: '/scan', label: 'Scan' },
        ].map(link => (
          <Link key={link.path} to={link.path} style={{
            textDecoration: 'none',
            padding: '0.4rem 0.9rem',
            borderRadius: '9999px',
            fontSize: '0.9rem',
            fontWeight: '500',
            color: isActive(link.path) ? 'white' : 'var(--text-secondary)',
            background: isActive(link.path) ? 'rgba(59,130,246,0.2)' : 'transparent',
            border: isActive(link.path) ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>{link.label}</Link>
        ))}
      </div>
    </nav>
  );
};

// --- Landing Page ---
function Home() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(() => setHealth('connected'))
      .catch(() => setHealth('unavailable'));
  }, []);

  const features = [
    { icon: '📦', title: 'Create Shipment', desc: 'Register your waste package and obtain your source location automatically.' },
    { icon: '🔖', title: 'Get QR Code', desc: 'A unique QR code is generated and attached to your physical package.' },
    { icon: '📍', title: 'Track in Transit', desc: 'Couriers scan the QR to log location updates throughout the journey.' },
    { icon: '✅', title: 'Verify Delivery', desc: 'When scanned near the destination, the package is marked as delivered.' },
  ];

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>♻️</div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 50%, #06b6d4 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1.2,
        }}>
          Waste Tracking,<br />Made Transparent
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Attach a QR code to your waste package. Track where it was scanned and verify whether it reached its intended destination.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/create" className="btn" style={{ textDecoration: 'none', padding: '0.9rem 2rem', fontSize: '1.05rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#3b82f6,#10b981)', border: 'none' }}>
            Create a Shipment
          </Link>
          <Link to="/scan" className="btn" style={{ textDecoration: 'none', padding: '0.9rem 2rem', fontSize: '1.05rem', borderRadius: '9999px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
            Scan a QR Code
          </Link>
        </div>
        {health && (
          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: health === 'connected' ? 'var(--success-color)' : '#f59e0b' }}>
            ● API {health}
          </p>
        )}
      </div>

      {/* Feature Cards */}
      <div style={{ padding: '0 2rem 5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', color: 'var(--text-secondary)', fontWeight: '400', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: '0 2rem 4rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Important: </strong>
          TrashTrace tracks QR code scans via GPS location, not physical package movement. Delivery is considered verified when the QR code is scanned within {import.meta.env.VITE_DELIVERY_RADIUS_LABEL || '500 metres'} of the intended destination.
        </p>
      </div>
    </div>
  );
}

// --- App Root ---
function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      <NavBar />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Suspense fallback={<div className="loading-center"><div className="loader" /><p>Loading…</p></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<OwnerDashboard />} />
            <Route path="/create" element={<CreateShipment />} />
            <Route path="/scan" element={<ScanQR />} />
            <Route path="/track/:id" element={<TrackShipment />} />
            <Route path="*" element={
              <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>404 — Page Not Found</h2>
                <Link to="/" className="btn" style={{ textDecoration: 'none' }}>Go Home</Link>
              </div>
            } />
          </Routes>
        </Suspense>
      </main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export default App;
