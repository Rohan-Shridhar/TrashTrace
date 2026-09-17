import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentLocation } from '../utils/geolocation';
import QRCodeDisplay from '../components/QRCodeDisplay';

const CreateShipment = () => {
  const [formData, setFormData] = useState({
    trashType: 'Plastic',
    description: '',
    destination: ''
  });
  
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const [createdData, setCreatedData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!location) {
      setSubmitError('Please obtain your current location first.');
      return;
    }

    if (!formData.destination.trim()) {
      setSubmitError('Please enter a destination.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/trash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          sourceLatitude: location.latitude,
          sourceLongitude: location.longitude
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create shipment');
      }

      setCreatedData({
        trackingId: data.trackingId,
        trackingUrl: data.trackingUrl,
        trashType: formData.trashType,
        destination: formData.destination
      });

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdData) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Shipment Created!</h2>
        <QRCodeDisplay 
          trackingId={createdData.trackingId} 
          trackingUrl={createdData.trackingUrl}
          trashType={createdData.trashType}
          destination={createdData.destination}
        />
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            className="btn" 
            style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
            onClick={() => {
              setCreatedData(null);
              setFormData({ trashType: 'Plastic', description: '', destination: '' });
              setLocation(null);
            }}
          >
            Create Another
          </button>
          <br /><br />
          <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Create New Tracking</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Enter shipment details to generate a tracking QR code.
      </p>
      
      {submitError && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Source Location</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn" 
              onClick={handleGetLocation} 
              disabled={isLocating}
              style={{ flex: 1, backgroundColor: location ? '#10b981' : 'var(--primary-color)' }}
            >
              {isLocating ? 'Locating...' : (location ? 'Location Updated' : 'Get Current Location')}
            </button>
            <div style={{ flex: 2, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {location ? (
                <>Lat: {location.latitude.toFixed(4)}<br/>Lng: {location.longitude.toFixed(4)}</>
              ) : (
                'Location required for tracking.'
              )}
            </div>
          </div>
          {locationError && <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.9rem' }}>{locationError}</p>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Destination Address/Name</label>
          <input 
            type="text" 
            name="destination"
            value={formData.destination}
            onChange={handleInputChange}
            placeholder="e.g. City Recycling Center, 123 Main St" 
            required
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Trash Type</label>
          <select 
            name="trashType" 
            value={formData.trashType}
            onChange={handleInputChange}
          >
            <option value="Plastic">Plastic</option>
            <option value="Electronic Waste">Electronic Waste</option>
            <option value="Organic">Organic</option>
            <option value="Glass">Glass</option>
            <option value="Paper">Paper</option>
            <option value="Hazardous">Hazardous</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description (Optional)</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3" 
            placeholder="Additional details about the package..."
          ></textarea>
        </div>
        
        <button 
          className="btn" 
          type="submit" 
          disabled={isSubmitting}
          style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
        >
          {isSubmitting ? 'Creating Shipment...' : 'Generate Tracking QR'}
        </button>
      </form>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
          &larr; Cancel and return home
        </Link>
      </div>
    </div>
  );
};

export default CreateShipment;
