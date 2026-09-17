import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentLocation } from '../utils/geolocation';
import { getOwnerToken } from '../utils/owner';
import QRCodeDisplay from '../components/QRCodeDisplay';

const TRASH_TYPES = ['Plastic', 'Electronic Waste', 'Organic', 'Glass', 'Paper', 'Metal', 'Hazardous', 'Other'];

const CreateShipment = () => {
  const [formData, setFormData] = useState({ trashType: 'Plastic', description: '', destination: '' });
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

    if (!location) { setSubmitError('Please obtain your current location first.'); return; }
    if (!formData.destination.trim()) { setSubmitError('Please enter a destination.'); return; }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sourceLatitude: location.latitude,
          sourceLongitude: location.longitude,
          ownerToken: getOwnerToken(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create shipment.');
      setCreatedData({ trackingId: data.trackingId, trackingUrl: data.trackingUrl, trashType: formData.trashType, destination: formData.destination });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdData) {
    return (
      <div className="page-container fade-up">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Shipment Created!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Attach the QR code below to your waste package.
          </p>
          <QRCodeDisplay
            trackingId={createdData.trackingId}
            trackingUrl={createdData.trackingUrl}
            trashType={createdData.trashType}
            destination={createdData.destination}
          />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { setCreatedData(null); setFormData({ trashType: 'Plastic', description: '', destination: '' }); setLocation(null); }}>
              Create Another
            </button>
            <Link to="/dashboard" className="btn" style={{ flex: 1, textDecoration: 'none' }}>
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-up">
      <div className="card">
        <h2 style={{ marginBottom: '0.5rem' }}>New Shipment</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Fill in the details to generate a tracking QR code for your waste package.
        </p>

        {submitError && <div className="alert alert-error">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Location */}
          <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
            <label className="form-label">Your Current Location (Source)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button type="button" className={`btn ${location ? 'btn-success' : ''}`} onClick={handleGetLocation} disabled={isLocating} style={{ flex: '1 1 auto' }}>
                {isLocating ? 'Locating…' : location ? '✓ Location Obtained' : '📍 Get My Location'}
              </button>
              <div style={{ flex: '2 1 auto', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {location
                  ? `Lat: ${location.latitude.toFixed(5)}, Lng: ${location.longitude.toFixed(5)}`
                  : 'Your location is required and never shared publicly.'}
              </div>
            </div>
            {locationError && <p style={{ color: 'var(--error-color)', marginTop: '0.5rem', fontSize: '0.875rem' }}>{locationError}</p>}
          </div>

          {/* Destination */}
          <div className="form-group">
            <label className="form-label" htmlFor="destination">Destination (Address or Name)</label>
            <input id="destination" name="destination" type="text" value={formData.destination} onChange={handleInputChange}
              placeholder="e.g. Bengaluru City Recycling Center" required />
          </div>

          {/* Trash Type */}
          <div className="form-group">
            <label className="form-label" htmlFor="trashType">Waste Type</label>
            <select id="trashType" name="trashType" value={formData.trashType} onChange={handleInputChange}>
              {TRASH_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description (Optional)</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange}
              rows="3" placeholder="Additional details about the package contents…" maxLength={500} />
          </div>

          <button className="btn" type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}>
            {isSubmitting ? 'Generating…' : 'Generate Tracking QR Code'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>Cancel</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateShipment;
