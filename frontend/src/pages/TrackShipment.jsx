import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCurrentLocation } from '../utils/geolocation';

const TrackShipment = () => {
  const { id: trackingId } = useParams();
  
  const [trashData, setTrashData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [locationError, setLocationError] = useState('');

  const fetchTrackingData = async () => {
    setLoading(true);
    try {
      const [trashRes, historyRes] = await Promise.all([
        fetch(`/api/trash/${trackingId}`),
        fetch(`/api/trash/${trackingId}/history`)
      ]);
      
      if (!trashRes.ok) throw new Error('Tracking ID not found');
      
      const trash = await trashRes.json();
      const scans = await historyRes.json();
      
      setTrashData(trash);
      setHistory(scans);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, [trackingId]);

  const performScan = async () => {
    setIsScanning(true);
    setLocationError('');
    setScanResult(null);
    
    try {
      const coords = await getCurrentLocation();
      
      const response = await fetch(`/api/trash/${trackingId}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to record scan');
      }

      setScanResult(data);
      await fetchTrackingData(); // Refresh data to get new history
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
        <div className="loader" style={{ marginBottom: '1rem' }}>Loading tracking details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Tracking Not Found</h2>
        <p style={{ margin: '1rem 0', color: 'var(--text-secondary)' }}>{error}</p>
        <Link to="/" className="btn" style={{ textDecoration: 'none' }}>Back to Home</Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    let color = '';
    let text = status.replace('_', ' ');
    if (status === 'CREATED') color = 'var(--primary-color)';
    else if (status === 'IN_TRANSIT') color = '#f59e0b';
    else if (status === 'DELIVERED') color = 'var(--success-color)';

    return (
      <span style={{ 
        backgroundColor: color + '20', 
        color: color, 
        padding: '0.25rem 0.75rem', 
        borderRadius: '9999px',
        fontWeight: '600',
        fontSize: '0.9rem',
        border: `1px solid ${color}`
      }}>
        {text}
      </span>
    );
  };

  const getDistanceText = () => {
    if (trashData.status === 'DELIVERED') return null;
    if (history.length === 0) return null;
    
    const latest = history[0];
    const km = (latest.distanceFromDestination / 1000).toFixed(2);
    
    return (
      <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', color: '#fcd34d' }}>
        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Location Update</strong>
        Last scanned approximately {km} km from the intended destination.
      </div>
    );
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="header" style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>Package Tracker</h1>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>ID: {trackingId}</p>
          </div>
          <div>{getStatusBadge(trashData.status)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Package Info</h3>
          <div style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Type:</strong> {trashData.trashType}
          </div>
          {trashData.description && (
            <div style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Description:</strong> {trashData.description}
            </div>
          )}
          <div style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Created:</strong> {new Date(trashData.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Route Info</h3>
          <div style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Source:</strong> 
            <br />Lat {trashData.sourceLocation.coordinates[1].toFixed(4)}, Lng {trashData.sourceLocation.coordinates[0].toFixed(4)}
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Destination:</strong> 
            <br />{trashData.destination.name}
          </div>
        </div>
      </div>

      {getDistanceText()}

      {trashData.status !== 'DELIVERED' && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', textAlign: 'center', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Courier / Finder?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Scan this package's current location to update the tracking record.
          </p>
          <button className="btn" onClick={performScan} disabled={isScanning} style={{ padding: '1rem 2rem' }}>
            {isScanning ? 'Acquiring GPS...' : 'Record Location Scan'}
          </button>
          
          {locationError && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{locationError}</p>}
          
          {scanResult && (
            <p style={{ color: scanResult.isNearDestination ? 'var(--success-color)' : 'var(--primary-color)', marginTop: '1rem', fontWeight: 'bold' }}>
              {scanResult.message}
            </p>
          )}
        </div>
      )}

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Scan History</h3>
        
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No scans recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((scan, index) => (
              <div key={scan._id} style={{ 
                display: 'flex', 
                borderLeft: `2px solid ${scan.isNearDestination ? 'var(--success-color)' : 'var(--primary-color)'}`,
                paddingLeft: '1rem',
                marginLeft: '0.5rem',
                opacity: index === 0 ? 1 : 0.7
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: scan.isNearDestination ? 'var(--success-color)' : 'white' }}>
                    {scan.isNearDestination ? 'Delivered / Near Destination' : 'Transit Scan'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {new Date(scan.scannedAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Lat: {scan.location.coordinates[1].toFixed(4)}<br/>
                  Lng: {scan.location.coordinates[0].toFixed(4)}<br/>
                  {(scan.distanceFromDestination / 1000).toFixed(1)} km away
                </div>
              </div>
            ))}
            
            {/* Initial Creation Event */}
            <div style={{ 
              display: 'flex', 
              borderLeft: `2px solid var(--border-color)`,
              paddingLeft: '1rem',
              marginLeft: '0.5rem',
              opacity: 0.5
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>Shipment Created</div>
                <div style={{ fontSize: '0.9rem' }}>
                  {new Date(trashData.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TrackShipment;
