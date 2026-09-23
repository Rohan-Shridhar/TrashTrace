import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCurrentLocation } from '../../utils/geolocation';

import ShipmentProgress from '../../components/shipment/ShipmentProgress';
import Card, { CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

import './track-shipment.css';

const formatDate = (date) => {
  if (!date) return '—';

  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatCoordinates = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return '—';

  const [longitude, latitude] = coordinates;

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
};

const formatDistance = (meters) => {
  if (meters === undefined || meters === null) return '—';

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};

const getScanTitle = (scan) => {
  if (scan.isNearDestination) {
    return 'QR scanned near destination';
  }

  return 'Transit scan recorded';
};

const TrackShipment = () => {
  const { trackingId } = useParams();

  const [trashData, setTrashData] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [locationError, setLocationError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [trashResponse, historyResponse] = await Promise.all([
        fetch(`/api/trash/${trackingId}`),
        fetch(`/api/trash/${trackingId}/history`),
      ]);

      if (!trashResponse.ok) {
        throw new Error(
          'Tracking ID not found. Please check the QR code and try again.'
        );
      }

      const trash = await trashResponse.json();
      const scans = historyResponse.ok
        ? await historyResponse.json()
        : [];

      setTrashData(trash);
      setHistory(Array.isArray(scans) ? scans : []);
    } catch (err) {
      setError(err.message || 'Unable to load tracking information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingId) {
      fetchData();
    }
  }, [trackingId]);

  const performScan = async () => {
    setIsScanning(true);
    setLocationError('');
    setScanResult(null);

    try {
      const coordinates = await getCurrentLocation();

      const response = await fetch(
        `/api/trash/${trackingId}/scan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to record the location scan.'
        );
      }

      setScanResult(data);

      await fetchData();
    } catch (err) {
      setLocationError(
        err.message || 'Unable to record your location.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="tracking-loading">
        <Spinner size="large" />
        <p>Loading shipment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <main className="tracking-page">
        <div className="tracking-error">
          <div className="tracking-error-icon">?</div>

          <span className="eyebrow">TRACKING ERROR</span>

          <h1>Package not found</h1>

          <p>{error}</p>

          <Link to="/" className="tracking-link-button">
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const latestScan = history[0];

  const latestDistance = latestScan
    ? formatDistance(latestScan.distanceFromDestination)
    : null;

  const statusLabel =
    trashData.status === 'IN_TRANSIT'
      ? 'In transit'
      : trashData.status === 'DELIVERED'
        ? 'Delivered'
        : 'Created';

  return (
    <main className="tracking-page">
      <div className="tracking-container">

        {/* Header */}
{/* Header */}
    <section className="tracking-header">
      <div>
        <span className="eyebrow">PACKAGE TRACKING</span>

        <h1>
          Shipment <span>#{trackingId}</span>
        </h1>

        <p>
          Follow the recorded scan history for this waste package.
        </p>
      </div>

      <Badge status={trashData.status}>
        {statusLabel}
      </Badge>
    </section>

    {/* Shipment progress */}
    <section className="tracking-progress-card">
      <div className="tracking-progress-header">
        <div>
          <span className="eyebrow">SHIPMENT JOURNEY</span>

          <h2>Tracking progress</h2>
        </div>

        <span className="tracking-progress-status">
          {statusLabel}
        </span>
      </div>

      <ShipmentProgress
        status={trashData.status}
      />
    </section>

        {/* Status hero */}
        <section
          className={`tracking-status-card tracking-status-${trashData.status.toLowerCase()}`}
        >
          <div className="tracking-status-main">
            <div className="tracking-status-icon">
              {trashData.status === 'DELIVERED'
                ? '✓'
                : trashData.status === 'IN_TRANSIT'
                  ? '→'
                  : '•'}
            </div>

            <div>
              <span className="tracking-status-label">
                Current status
              </span>

              <h2>{statusLabel}</h2>

              {trashData.status === 'DELIVERED' && trashData.deliveredAt ? (
                <p>
                  Last marked near the destination on{' '}
                  <strong>{formatDate(trashData.deliveredAt)}</strong>.
                </p>
              ) : latestScan ? (
                <p>
                  Last scan was{' '}
                  <strong>{formatDate(latestScan.scannedAt)}</strong>.
                </p>
              ) : (
                <p>
                  No location scans have been recorded yet.
                </p>
              )}
            </div>
          </div>

          {latestDistance && (
            <div className="tracking-distance">
              <span>Last scan</span>
              <strong>{latestDistance}</strong>
              <small>from destination</small>
            </div>
          )}
        </section>

        {/* Latest scan feedback */}
        {scanResult && (
          <div
            className={`tracking-feedback ${
              scanResult.isNearDestination
                ? 'tracking-feedback-success'
                : 'tracking-feedback-info'
            }`}
          >
            <div className="feedback-icon">
              {scanResult.isNearDestination ? '✓' : 'i'}
            </div>

            <div>
              <strong>
                {scanResult.isNearDestination
                  ? 'Destination reached'
                  : 'Location scan recorded'}
              </strong>

              <p>
                {scanResult.isNearDestination
                  ? 'The QR code was scanned within the configured destination radius.'
                  : 'The package is still outside the destination radius.'}
              </p>
            </div>
          </div>
        )}

        {/* Shipment overview */}
        <section className="tracking-grid">

          <Card>
            <CardBody>
              <div className="tracking-section-heading">
                <div>
                  <span className="eyebrow">SHIPMENT</span>
                  <h2>Package details</h2>
                </div>

                <div className="section-icon">□</div>
              </div>

              <div className="tracking-details">
                <div className="tracking-detail">
                  <span>Waste type</span>
                  <strong>{trashData.trashType}</strong>
                </div>

                <div className="tracking-detail">
                  <span>Description</span>
                  <strong>
                    {trashData.description || 'No description provided'}
                  </strong>
                </div>

                <div className="tracking-detail">
                  <span>Tracking ID</span>
                  <strong className="tracking-mono">
                    {trackingId}
                  </strong>
                </div>

                <div className="tracking-detail">
                  <span>Created</span>
                  <strong>
                    {formatDate(trashData.createdAt)}
                  </strong>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="tracking-section-heading">
                <div>
                  <span className="eyebrow">ROUTE</span>
                  <h2>Shipment route</h2>
                </div>

                <div className="section-icon">⌖</div>
              </div>

              <div className="route-card">
                <div className="route-point">
                  <div className="route-dot route-dot-origin" />

                  <div>
                    <span>Origin</span>

                    <strong>
                      {formatCoordinates(
                        trashData.sourceLocation?.coordinates
                      )}
                    </strong>
                  </div>
                </div>

                <div className="route-line" />

                <div className="route-point">
                  <div className="route-dot route-dot-destination" />

                  <div>
                    <span>Destination</span>

                    <strong>
                      {trashData.destination?.name || 'Unknown destination'}
                    </strong>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

        </section>

        {/* Scan action */}
        {trashData.status !== 'DELIVERED' && (
          <section className="tracking-action-card">
            <div className="tracking-action-icon">⌖</div>

            <div className="tracking-action-content">
              <span className="eyebrow">COURIER ACTION</span>

              <h2>Are you handling this package?</h2>

              <p>
                Record your current location to add a new point
                to this shipment's tracking history.
              </p>

              {locationError && (
                <div className="tracking-location-error">
                  {locationError}
                </div>
              )}
            </div>

            <Button
              onClick={performScan}
              loading={isScanning}
              disabled={isScanning}
            >
              {isScanning
                ? 'Acquiring GPS...'
                : 'Record location scan'}
            </Button>
          </section>
        )}

        {/* Scan history */}
        <section className="tracking-history">
          <div className="tracking-section-heading">
            <div>
              <span className="eyebrow">ACTIVITY</span>
              <h2>Scan history</h2>
            </div>

            <span className="history-count">
              {history.length} {history.length === 1 ? 'scan' : 'scans'}
            </span>
          </div>

          {history.length === 0 ? (
            <Card>
              <CardBody>
                <div className="tracking-empty-history">
                  <div className="tracking-empty-icon">⌖</div>

                  <h3>No scans yet</h3>

                  <p>
                    Once someone records a location scan,
                    it will appear here.
                  </p>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="timeline">

              {history.map((scan, index) => (
                <div className="timeline-item" key={scan._id || index}>

                  <div className="timeline-marker">
                    <div
                      className={
                        scan.isNearDestination
                          ? 'timeline-dot timeline-dot-success'
                          : 'timeline-dot'
                      }
                    />
                  </div>

                  <div className="timeline-card">
                    <div className="timeline-card-header">
                      <div>
                        <h3>{getScanTitle(scan)}</h3>

                        <span>
                          {formatDate(scan.scannedAt)}
                        </span>
                      </div>

                      <Badge
                        status={
                          scan.isNearDestination
                            ? 'DELIVERED'
                            : 'IN_TRANSIT'
                        }
                      >
                        {scan.isNearDestination
                          ? 'Destination'
                          : 'Transit'}
                      </Badge>
                    </div>

                    <div className="timeline-meta">

                      <div>
                        <span>Distance</span>
                        <strong>
                          {formatDistance(
                            scan.distanceFromDestination
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Coordinates</span>
                        <strong className="tracking-mono">
                          {formatCoordinates(
                            scan.location?.coordinates
                          )}
                        </strong>
                      </div>

                    </div>
                  </div>
                </div>
              ))}

              {/* Shipment creation */}
              <div className="timeline-item timeline-origin">

                <div className="timeline-marker">
                  <div className="timeline-dot timeline-dot-origin" />
                </div>

                <div className="timeline-card timeline-origin-card">
                  <h3>Shipment created</h3>

                  <span>
                    {formatDate(trashData.createdAt)}
                  </span>

                  <p>
                    Package registered and tracking ID generated.
                  </p>
                </div>

              </div>

            </div>
          )}
        </section>

        {/* Important limitation */}
        <section className="tracking-notice">
          <div className="tracking-notice-icon">!</div>

          <div>
            <strong>What this tracking means</strong>

            <p>
              TrashTrace records where the package QR code was
              scanned. It does not continuously track the physical
              package. A scan near the destination is therefore
              evidence of a nearby scan, not guaranteed physical
              delivery.
            </p>
          </div>
        </section>

        {/* Footer navigation */}
        <div className="tracking-footer">
          <Link to="/">← Back to home</Link>
          <Link to="/create">Create another shipment →</Link>
        </div>

      </div>
    </main>
  );
};

export default TrackShipment;