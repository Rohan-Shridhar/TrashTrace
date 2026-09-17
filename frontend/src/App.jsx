import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CreateShipment from './pages/CreateShipment';
import TrackShipment from './pages/TrackShipment';
import ScanQR from './pages/ScanQR';

function Home() {
  const [health, setHealth] = useState('Checking backend...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data.message))
      .catch(err => setHealth('Backend not reachable'));
  }, []);

  return (
    <div className="card">
      <div className="header">
        <h1>TrashTrace</h1>
        <p>Smart Waste Tracking & Delivery</p>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p>Status: <span style={{ color: 'var(--success-color)' }}>{health}</span></p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/create" style={{ flex: '1 1 auto' }}>
          <button className="btn" style={{ width: '100%' }}>Create Shipment</button>
        </Link>
        <Link to="/scan" style={{ flex: '1 1 auto' }}>
          <button className="btn" style={{ width: '100%', backgroundColor: '#475569' }}>Scan QR Code</button>
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateShipment />} />
        <Route path="/scan" element={<ScanQR />} />
        <Route path="/track/:id" element={<TrackShipment />} />
      </Routes>
    </div>
  );
}

export default App;
