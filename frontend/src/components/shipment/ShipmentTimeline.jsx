import React from 'react';
import Badge from '../ui/Badge';
import './shipment-timeline.css';

const formatDate = (date) => {
  if (!date) return '—';

  return new Date(date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatDistance = (meters) => {
  if (meters === undefined || meters === null) {
    return '—';
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
};

const formatCoordinates = (coordinates) => {
  if (!coordinates || coordinates.length < 2) {
    return '—';
  }

  const [longitude, latitude] = coordinates;

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
};

const getScanTitle = (scan) => {
  if (scan.isNearDestination) {
    return 'Destination scan';
  }

  return 'Transit scan';
};

const getScanDescription = (scan) => {
  if (scan.isNearDestination) {
    return 'The QR code was scanned within the configured destination radius.';
  }

  return 'A QR code scan was recorded while the package was away from its destination.';
};

const ShipmentTimeline = ({
  history = [],
  createdAt,
}) => {
  const events = history.map((scan) => ({
    type: scan.isNearDestination
      ? 'destination'
      : 'transit',

    title: getScanTitle(scan),

    description: getScanDescription(scan),

    date: scan.scannedAt,

    distance: formatDistance(
      scan.distanceFromDestination
    ),

    coordinates: formatCoordinates(
      scan.location?.coordinates
    ),

    scan,
  }));

  return (
    <div className="shipment-timeline">

      {/* Scan events */}
      {events.map((event, index) => (
        <div
          className="shipment-timeline__item"
          key={event.scan?._id || index}
        >

          {/* Timeline marker */}
          <div className="shipment-timeline__rail">

            <div
              className={[
                'shipment-timeline__marker',
                event.type === 'destination'
                  ? 'shipment-timeline__marker--success'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {event.type === 'destination'
                ? '✓'
                : '•'}
            </div>

            {index < events.length - 1 && (
              <div className="shipment-timeline__line" />
            )}
          </div>

          {/* Event card */}
          <article className="shipment-timeline__event">

            <div className="shipment-timeline__event-header">

              <div>
                <span className="shipment-timeline__eyebrow">
                  {event.type === 'destination'
                    ? 'DESTINATION EVENT'
                    : 'LOCATION EVENT'}
                </span>

                <h3>
                  {event.title}
                </h3>

                <time>
                  {formatDate(event.date)}
                </time>
              </div>

              <Badge
                status={
                  event.type === 'destination'
                    ? 'DELIVERED'
                    : 'IN_TRANSIT'
                }
              >
                {event.type === 'destination'
                  ? 'Destination'
                  : 'Transit'}
              </Badge>

            </div>

            <p className="shipment-timeline__description">
              {event.description}
            </p>

            <div className="shipment-timeline__meta">

              <div className="shipment-timeline__meta-item">
                <span>Distance</span>

                <strong>
                  {event.distance}
                </strong>
              </div>

              <div className="shipment-timeline__meta-item">
                <span>Coordinates</span>

                <strong className="shipment-timeline__coordinates">
                  {event.coordinates}
                </strong>
              </div>

            </div>

          </article>
        </div>
      ))}

      {/* Creation event */}
      <div className="shipment-timeline__item shipment-timeline__item--origin">

        <div className="shipment-timeline__rail">

          <div className="shipment-timeline__marker shipment-timeline__marker--origin">
            +
          </div>

        </div>

        <article className="shipment-timeline__event shipment-timeline__event--origin">

          <span className="shipment-timeline__eyebrow">
            SHIPMENT CREATED
          </span>

          <h3>
            Shipment created
          </h3>

          <time>
            {formatDate(createdAt)}
          </time>

          <p className="shipment-timeline__description">
            The package was registered and its unique tracking ID
            was generated.
          </p>

        </article>

      </div>

    </div>
  );
};

export default ShipmentTimeline;