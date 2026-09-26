import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCodeCard from '../../components/qr/QRCodeCard';

import { getCurrentLocation } from '../../utils/geolocation';
import { requestJson } from '../../utils/api';
import { getOwnerToken } from '../../utils/owner';

import Button from '../../components/ui/Button';
import Card, { CardBody } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';

import './create-shipment.css';

const TRASH_TYPES = [
  'Plastic',
  'Electronic Waste',
  'Organic',
  'Glass',
  'Paper',
  'Metal',
  'Hazardous',
  'Other',
];

const CreateShipment = () => {
  const [formData, setFormData] = useState({
    trashType: 'Plastic',
    description: '',
    destination: '',
  });

  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [createdData, setCreatedData] = useState(null);

  const qrRef = useRef(null);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError('');

    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (error) {
      setLocationError(
        error.message || 'Unable to determine your current location.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError('');

    if (!location) {
      setSubmitError(
        'Please get your current location before creating the shipment.'
      );
      return;
    }

    if (!formData.destination.trim()) {
      setSubmitError('Please enter a destination.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await requestJson('/api/trash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          sourceLatitude: location.latitude,
          sourceLongitude: location.longitude,
          ownerToken: getOwnerToken(),
        }),
      });

      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('The server returned an invalid shipment response.');
      }

      setCreatedData(data);
    } catch (error) {
      setSubmitError(
        error.message || 'Something went wrong while creating the shipment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedData(null);
    setSubmitError('');
    setLocationError('');

    setFormData({
      trashType: 'Plastic',
      description: '',
      destination: '',
    });

    setLocation(null);
  };

  if (createdData) {
    return (
      <main className="create-page">
        <div className="create-success">
          <div className="success-header">
            <div className="success-icon">✓</div>

            <div>
              <Badge status="CREATED" />

              <h1>Shipment created</h1>

              <p>
                Your waste package now has a unique tracking identity.
                Attach the QR code to the package before it leaves.
              </p>
            </div>
          </div>

          <div className="success-grid">
            <QRCodeCard
                trackingId={createdData.trackingId}
                trackingUrl={createdData.trackingUrl}
                trashType={formData.trashType}
                destination={formData.destination}
            />

            <Card className="shipment-summary">
              <CardBody>
                <span className="eyebrow">
                  SHIPMENT DETAILS
                </span>

                <h2>Ready for tracking</h2>

                <div className="summary-list">
                  <div className="summary-row">
                    <span>Waste type</span>
                    <strong>
                      {formData.trashType}
                    </strong>
                  </div>

                  <div className="summary-row">
                    <span>Destination</span>
                    <strong>
                      {formData.destination}
                    </strong>
                  </div>

                  {formData.description && (
                    <div className="summary-row">
                      <span>Description</span>
                      <strong>
                        {formData.description}
                      </strong>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>Starting location</span>
                    <strong>
                      {location
                        ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                        : 'Captured'}
                    </strong>
                  </div>
                </div>

                <div className="success-note">
                  <span>↗</span>

                  <p>
                    The QR code contains the shipment's tracking
                    URL. Print it or download it and attach it to
                    the physical package.
                  </p>
                </div>

                <div className="success-links">
                  <Link
                    to={`/track/${createdData.trackingId}`}
                    className="text-link"
                  >
                    View tracking page →
                  </Link>

                  <button
                    type="button"
                    className="text-button"
                    onClick={handleCreateAnother}
                  >
                    Create another shipment
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="create-page">
      <div className="create-container">

        <header className="create-header">
          <div>
            <span className="eyebrow">
              NEW SHIPMENT
            </span>

            <h1>Create a shipment</h1>

            <p>
              Register a waste package, record where it starts,
              and generate its tracking QR code.
            </p>
          </div>

          <div className="create-step">
            <span>01</span>
            <div>
              <strong>Shipment details</strong>
              <small>Then generate your QR</small>
            </div>
          </div>
        </header>

        {submitError && (
          <div className="form-alert form-alert-error">
            <span>!</span>
            <div>
              <strong>Couldn&apos;t create shipment</strong>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <div className="create-layout">

          <Card className="create-form-card">
            <CardBody>

              <form onSubmit={handleSubmit}>

                <section className="form-section">
                  <div className="section-heading">
                    <div className="section-number">
                      01
                    </div>

                    <div>
                      <h2>Package details</h2>
                      <p>
                        Tell us what is being transported.
                      </p>
                    </div>
                  </div>

                  <Select
                    label="Waste type"
                    name="trashType"
                    value={formData.trashType}
                    onChange={handleInputChange}
                    options={TRASH_TYPES.map((type) => ({
                      value: type,
                      label: type,
                    }))}
                    required
                  />

                  <Input
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g. Sorted plastic bottles from collection drive"
                    hint="Optional · maximum 500 characters"
                    maxLength={500}
                  />
                </section>

                <div className="form-divider" />

                <section className="form-section">
                  <div className="section-heading">
                    <div className="section-number">
                      02
                    </div>

                    <div>
                      <h2>Destination</h2>
                      <p>
                        Where should this shipment end up?
                      </p>
                    </div>
                  </div>

                  <Input
                    label="Destination address"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g. Bengaluru City Recycling Center"
                    hint="Use a specific address or recognizable facility name."
                    required
                  />
                </section>

                <div className="form-divider" />

                <section className="form-section">
                  <div className="section-heading">
                    <div className="section-number">
                      03
                    </div>

                    <div>
                      <h2>Starting location</h2>
                      <p>
                        Record the GPS location where the shipment
                        is being created.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`location-box ${
                      location ? 'location-box-ready' : ''
                    }`}
                  >
                    <div className="location-icon">
                      {location ? '✓' : '⌖'}
                    </div>

                    <div className="location-content">
                      <strong>
                        {location
                          ? 'Location captured'
                          : 'Location required'}
                      </strong>

                      {location ? (
                        <span>
                          {location.latitude.toFixed(5)}
                          {' · '}
                          {location.longitude.toFixed(5)}
                        </span>
                      ) : (
                        <span>
                          We use your current browser location
                          as the shipment starting point.
                        </span>
                      )}

                      {locationError && (
                        <small className="location-error">
                          {locationError}
                        </small>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={handleGetLocation}
                      loading={isLocating}
                    >
                      {location ? 'Refresh' : 'Get location'}
                    </Button>
                  </div>
                </section>

                <div className="form-submit-area">
                  <Button
                    type="submit"
                    size="large"
                    fullWidth
                    loading={isSubmitting}
                    disabled={!location}
                  >
                    Generate tracking QR
                  </Button>

                  <p>
                    Your browser will ask for location permission
                    the first time you use this feature.
                  </p>
                </div>

              </form>

            </CardBody>
          </Card>

          <aside className="create-sidebar">

            <Card className="process-card">
              <CardBody>
                <span className="eyebrow">
                  HOW IT WORKS
                </span>

                <h2>From package to trace</h2>

                <div className="process-list">

                  <div className="process-item">
                    <div className="process-icon">1</div>

                    <div>
                      <strong>Create</strong>
                      <p>
                        Add the waste type and destination.
                      </p>
                    </div>
                  </div>

                  <div className="process-item">
                    <div className="process-icon">2</div>

                    <div>
                      <strong>Generate</strong>
                      <p>
                        TrashTrace creates a unique tracking ID
                        and QR code.
                      </p>
                    </div>
                  </div>

                  <div className="process-item">
                    <div className="process-icon">3</div>

                    <div>
                      <strong>Attach</strong>
                      <p>
                        Print or download the QR and attach it
                        to the package.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="privacy-note">
              <span>●</span>

              <p>
                TrashTrace records the starting GPS coordinates
                and uses your browser-generated device token to
                associate the shipment with your dashboard.
              </p>
            </div>

          </aside>
        </div>

        <Link
          to="/"
          className="back-link"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
};

export default CreateShipment;