import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCurrentLocation } from '../utils/geolocation';

const TrackShipment = () => {
  const { id: trackingId } = useParams();
  
  const [trashData, setTrashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [locationError, setLocationError] = useState('');

  // 1. Fetch initial trash data
  useEffect(() => {
    const fetchTrashData = async () => {
      try {
        const response = await fetch(`/api/trash/${trackingId}`);
        if (!response.ok) {
          throw new Error('Tracking ID not found');
        }
        const data = await response.json();
        setTrashData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrashData();
  }, [trackingId]);

  // 2. Perform Scan (obtain location and send to backend)
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
      
      // Update local state to reflect new status
      setTrashData(prev => ({
        ...prev,
        status: data.status,
        latestScan: {
          scannedAt: new Date(),
        }
      }));

    } catch (err) {
      setLocationError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading tracking details...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Error</h2>
        <p style={{ margin: '1rem 0' }}>{error}</p>
        <Link to="/" className="btn" style={{ textDecoration: 'none' }}>Back to Home</Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'CREATED': return '#3b82f6'; // Blue
      case 'IN_TRANSIT': return '#f59e0b'; // Yellow
      case 'DELIVERED': return '#10b981'; // Green
      default: return 'white';
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Tracking Details</h2>
        <p style={{ color: 'var(--text-secondary)' }}>ID: {trackingId}</p>
      </div>

      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: 'rgba(0,0,0,0.2)', 
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
          <strong style={{ color: getStatusColor(trashData.status) }}>
            {trashData.status.replace('_', ' ')}
          </strong>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Type:</span>
          <span>{trashData.trashType}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Destination:</span>
          <span style={{ textAlign: 'right' }}>{trashData.destination.name}</span>
        </div>
      </div>

      {trashData.status !== 'DELIVERED' && !scanResult && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Are you handling this package? Scan its current location to update tracking.
          </p>
          <button 
            className="btn" 
            onClick={performScan} 
            disabled={isScanning}
            style={{ width: '100%' }}
          >
            {isScanning ? 'Verifying Location...' : 'Update Tracking (Record Scan)'}
          </button>
          
          {locationError && (
            <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.9rem' }}>
              {locationError}
            </p>
          )}
        </div>
      )}

      {scanResult && (
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: scanResult.isNearDestination ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
          border: `1px solid ${scanResult.isNearDestination ? '#10b981' : '#3b82f6'}`,
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: scanResult.isNearDestination ? '#10b981' : '#3b82f6', marginBottom: '0.5rem' }}>
            {scanResult.isNearDestination ? 'QR Scanned Near Destination!' : 'Transit Scan Recorded!'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            You are approximately {Math.round(scanResult.distance)} meters away from the target destination.
          </p>
        </div>
      )}

      {trashData.status === 'DELIVERED' && !scanResult && (
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Package Delivered</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            This QR code was successfully scanned near its destination on {new Date(trashData.deliveredAt).toLocaleString()}.
          </p>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default TrackShipment;
