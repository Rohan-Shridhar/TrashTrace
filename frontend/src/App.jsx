import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CreateShipment from './pages/CreateShipment';

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

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/create">
          <button className="btn">Create Shipment</button>
        </Link>
        <Link to="/track/demo-123">
          <button className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--primary-color)' }}>
            Demo Track
          </button>
        </Link>
      </div>
    </div>
  );
}

function TrackShipment() {
  return (
    <div className="card">
      <h2>Tracking Shipment</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Scan location received. Verifying delivery status...
      </p>
      
      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
        <h3 style={{ color: 'var(--success-color)' }}>Map / Status will appear here</h3>
      </div>
      
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
          &larr; Back to Home
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
        <Route path="/track/:id" element={<TrackShipment />} />
      </Routes>
    </div>
  );
}

export default App;
