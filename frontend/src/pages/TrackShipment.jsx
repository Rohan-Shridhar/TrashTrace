import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCurrentLocation } from '../utils/geolocation';

const getStatusBadgeClass = (status) => {
  if (status === 'CREATED') return 'badge badge-created';
  if (status === 'IN_TRANSIT') return 'badge badge-transit';
  if (status === 'DELIVERED') return 'badge badge-delivered';
  return 'badge';
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: '0.9rem', textAlign: 'right' }}>{value}</span>
  </div>
);

const TrackShipment = () => {
  const { id: trackingId } = useParams();
  const [trashData, setTrashData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [locationError, setLocationError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [trashRes, historyRes] = await Promise.all([
        fetch(`/api/trash/${trackingId}`),
        fetch(`/api/trash/${trackingId}/history`),
      ]);
      if (!trashRes.ok) throw new Error('Tracking ID not found. Please check the QR code and try again.');
      const [trash, scans] = await Promise.all([trashRes.json(), historyRes.json()]);
      setTrashData(trash);
      setHistory(Array.isArray(scans) ? scans : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [trackingId]);

  const performScan = async () => {
    setIsScanning(true);
    setLocationError('');
    setScanResult(null);
    try {
      const coords = await getCurrentLocation();
      const res = await fetch(`/api/trash/${trackingId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record scan.');
      setScanResult(data);
      await fetchData();
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  if (loading) return (
    <div className="loading-center">
      <div className="loader" />
      <p>Loading tracking details…</p>
    </div>
  );

  if (error) return (
    <div className="page-container fade-up">
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ marginBottom: '0.75rem' }}>Package Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
        <Link to="/" className="btn" style={{ textDecoration: 'none' }}>Go Home</Link>
      </div>
    </div>
  );

  const latestScanKm = history.length > 0 ? (history[0].distanceFromDestination / 1000).toFixed(1) : null;

  return (
    <div className="container fade-up" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', fontSize: '1.75rem' }}>Package Tracker</h1>
          <code style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>ID: {trackingId}</code>
        </div>
        <span className={getStatusBadgeClass(trashData.status)}>{trashData.status.replace('_', ' ')}</span>
      </div>

      {/* Distance banner */}
      {trashData.status !== 'DELIVERED' && latestScanKm && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          📍 Last scanned approximately <strong>{latestScanKm} km</strong> from the intended destination.
        </div>
      )}

      {trashData.status === 'DELIVERED' && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          ✅ QR code scanned near destination on {new Date(trashData.deliveredAt).toLocaleString()}. Marked as <strong>DELIVERED</strong>. (This confirms a scan near the destination, not guaranteed physical delivery.)
        </div>
      )}

      {/* Scan result feedback */}
      {scanResult && (
        <div className={`alert ${scanResult.isNearDestination ? 'alert-success' : 'alert-info'}`} style={{ marginBottom: '1.5rem' }}>
          {scanResult.isNearDestination
            ? `✅ ${scanResult.message}`
            : `📍 ${scanResult.message} You are ${Math.round(scanResult.distanceMeters)} m away (delivery radius: ${scanResult.deliveryRadiusMeters} m).`}
        </div>
      )}

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Package Info</h3>
          <InfoRow label="Waste Type" value={trashData.trashType} />
          {trashData.description && <InfoRow label="Description" value={trashData.description} />}
          <InfoRow label="Created" value={new Date(trashData.createdAt).toLocaleString()} />
          {trashData.deliveredAt && <InfoRow label="Delivered" value={new Date(trashData.deliveredAt).toLocaleString()} />}
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</h3>
          <InfoRow label="From" value={`${trashData.sourceLocation.coordinates[1].toFixed(4)}, ${trashData.sourceLocation.coordinates[0].toFixed(4)}`} />
          <InfoRow label="To" value={trashData.destination.name} />
          {history.length > 0 && <InfoRow label="Last Scan" value={`${latestScanKm} km from destination`} />}
        </div>
      </div>

      {/* Courier action */}
      {trashData.status !== 'DELIVERED' && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Are you handling this package?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Record your current location to update the tracking history.
          </p>
          <button className="btn" onClick={performScan} disabled={isScanning} style={{ minWidth: '200px' }}>
            {isScanning ? 'Acquiring GPS…' : '📍 Record Location Scan'}
          </button>
          {locationError && <p className="alert alert-error" style={{ marginTop: '1rem' }}>{locationError}</p>}
        </div>
      )}

      {/* Timeline */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Scan History</h3>
        {history.length === 0 ? (
          <div className="empty-state">
            <p>No scans recorded yet.</p>
          </div>
        ) : (
          <div className="timeline">
            {history.map((scan, i) => (
              <div key={scan._id} className="timeline-item">
                <div className="timeline-dot" style={{ background: scan.isNearDestination ? 'var(--success-color)' : 'var(--primary-color)' }} />
                <div className="timeline-content">
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: scan.isNearDestination ? 'var(--success-color)' : 'white' }}>
                    {scan.isNearDestination ? '✅ QR Scanned Near Destination' : '🚚 Transit Scan'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {new Date(scan.scannedAt).toLocaleString()} · {(scan.distanceFromDestination / 1000).toFixed(1)} km from destination
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    {scan.location.coordinates[1].toFixed(5)}, {scan.location.coordinates[0].toFixed(5)}
                  </div>
                </div>
              </div>
            ))}
            {/* Origin */}
            <div className="timeline-item">
              <div className="timeline-dot" style={{ background: 'var(--border-color)' }} />
              <div className="timeline-content">
                <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Shipment Created</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(trashData.createdAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>← Back to Home</Link>
      </div>
    </div>
  );
};

export default TrackShipment;
