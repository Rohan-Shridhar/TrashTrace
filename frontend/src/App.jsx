import { Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

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

function CreateShipment() {
  return (
    <div className="card">
      <h2>Create New Shipment</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Enter details to generate a tracking QR code.
      </p>
      
      <form>
        <div>
          <label>Destination Location</label>
          <input type="text" placeholder="e.g. Recycling Center A" />
        </div>
        <div>
          <label>Trash Type</label>
          <select>
            <option>Plastic</option>
            <option>Electronic Waste</option>
            <option>Organic</option>
            <option>Hazardous</option>
          </select>
        </div>
        <div>
          <label>Description (Optional)</label>
          <textarea rows="3" placeholder="Additional details..."></textarea>
        </div>
        
        <button className="btn" type="button" style={{ width: '100%' }}>
          Generate Tracking QR
        </button>
      </form>
      
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
          &larr; Back to Home
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
