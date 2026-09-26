import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { requestJson } from '../../utils/api';
import { getOwnerToken } from '../../utils/owner';

import './dashboard.css';

const getText = (value, fallback = '—') =>
  typeof value === 'string' || typeof value === 'number' ? value : fallback;

const getDestinationLabel = (destination) => {
  if (typeof destination === 'string') return destination;
  if (destination && typeof destination === 'object') {
    return getText(destination.name);
  }
  return '—';
};

const getRequestError = (reason, fallback) =>
  reason instanceof Error && reason.message ? reason.message : fallback;

const Dashboard = () => {
  const [packages, setPackages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const ownerToken = getOwnerToken();

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setNotificationsError('');

    const [packageResult, notificationResult] = await Promise.allSettled([
      requestJson(`/api/trash/owner/${ownerToken}`),
      requestJson(`/api/notifications/${ownerToken}`),
    ]);

    if (packageResult.status === 'fulfilled' && Array.isArray(packageResult.value)) {
      setPackages(packageResult.value);
    } else {
      setPackages([]);
      setError(
        packageResult.status === 'rejected'
          ? getRequestError(packageResult.reason, 'Unable to load packages.')
          : 'The server returned an invalid packages response.'
      );
    }

    if (notificationResult.status === 'rejected') {
      setNotifications([]);
      setNotificationsError(
        notificationResult.reason instanceof Error
          ? notificationResult.reason.message
          : 'Unable to load notifications.'
      );
    } else if (!Array.isArray(notificationResult.value)) {
      setNotifications([]);
      setNotificationsError('The server returned an invalid notifications response.');
    } else {
      setNotifications(notificationResult.value);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markAllRead = async () => {
    try {
      await requestJson(`/api/notifications/${ownerToken}/read`, {
        method: 'PUT',
      });

      setNotificationsError('');
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      setNotificationsError(
        err instanceof Error ? err.message : 'Unable to update notifications.'
      );
    }
  };

  const stats = useMemo(() => {
    return {
      total: packages.length,
      created: packages.filter((pkg) => pkg.status === 'CREATED').length,
      transit: packages.filter((pkg) => pkg.status === 'IN_TRANSIT').length,
      delivered: packages.filter((pkg) => pkg.status === 'DELIVERED').length,
    };
  }, [packages]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const filteredPackages = useMemo(() => {
    if (filter === 'ALL') return packages;

    return packages.filter((pkg) => pkg.status === filter);
  }, [packages, filter]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="lg" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* Header */}
        <section className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">OWNER DASHBOARD</span>

            <h1>
              Your shipment
              <br />
              <span>control center.</span>
            </h1>

            <p>
              Monitor packages, review scan activity, and keep track of
              delivery verification from this device.
            </p>
          </div>

          <Link to="/create" className="dashboard-new-link">
            <Button>
              + New shipment
            </Button>
          </Link>
        </section>

        {/* Error */}
        {error && (
          <div className="dashboard-alert">
            <div>
              <strong>Something went wrong</strong>
              <span>{error}</span>
            </div>

            <button onClick={fetchData}>
              Retry
            </button>
          </div>
        )}

        {/* Stats */}
        {!error && (
          <section className="dashboard-stats stagger-children">
            <div className="stat-card stat-card-main">
              <div className="stat-icon">📦</div>
              <div>
                <span>Total shipments</span>
                <strong>{stats.total}</strong>
              </div>
            </div>

            <div className="stat-card">
              <span>Created</span>
              <strong>{stats.created}</strong>
              <small>Awaiting first scan</small>
            </div>

            <div className="stat-card">
              <span>In transit</span>
              <strong>{stats.transit}</strong>
              <small>Latest scan away from destination</small>
            </div>

            <div className="stat-card stat-card-delivered">
              <span>Delivered</span>
              <strong>{stats.delivered}</strong>
              <small>Verified near destination</small>
            </div>
          </section>
        )}

        <div className="dashboard-grid">

          {/* Packages */}
          <section className="dashboard-packages">

            <div className="section-heading">
              <div>
                <span className="section-kicker">SHIPMENTS</span>
                <h2>Your packages</h2>
              </div>

              <div className="package-count">
                {error ? '—' : filteredPackages.length}
              </div>
            </div>

            {/* Filters */}
            <div className="shipment-filters">
              {[
                ['ALL', 'All'],
                ['CREATED', 'Created'],
                ['IN_TRANSIT', 'In transit'],
                ['DELIVERED', 'Delivered'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={filter === value ? 'active' : ''}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            {error ? null : filteredPackages.length === 0 ? (
              <EmptyState
                title={packages.length === 0 ? 'No shipments yet' : 'No matching shipments'}
                description={
                  packages.length === 0
                    ? 'Create your first waste shipment and generate its tracking QR code.'
                    : 'Try selecting another shipment status.'
                }
                action={
                  packages.length === 0 ? (
                    <Link to="/create">
                      <Button>Create shipment</Button>
                    </Link>
                  ) : null
                }
              />
            ) : (
              <div className="shipment-list stagger-children">
                {filteredPackages.map((pkg) => (
                  <article className="shipment-card" key={pkg._id || pkg.trackingId}>

                    <div className="shipment-card-top">
                      <div className="shipment-id">
                        <span>TRACKING ID</span>
                        <strong>{pkg.trackingId}</strong>
                      </div>

                      <Badge status={pkg.status} />
                    </div>

                    <div className="shipment-details">

                      <div className="shipment-detail">
                        <span>Waste type</span>
                        <strong>{pkg.trashType || '—'}</strong>
                      </div>

                      <div className="shipment-detail shipment-destination">
                        <span>Destination</span>
                        <strong>{getDestinationLabel(pkg.destination)}</strong>
                      </div>

                      <div className="shipment-detail">
                        <span>Created</span>
                        <strong>
                          {pkg.createdAt
                            ? new Date(pkg.createdAt).toLocaleDateString()
                            : '—'}
                        </strong>
                      </div>

                    </div>

                    <div className="shipment-card-footer">
                      <span>
                        {pkg.description
                          ? pkg.description
                          : 'No additional description'}
                      </span>

                      <Link to={`/track/${pkg.trackingId}`}>
                        View tracking →
                      </Link>
                    </div>

                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Notifications */}
          <aside className="dashboard-sidebar">

            <Card className="notifications-card">

              <div className="notifications-header">
                <div>
                  <span className="section-kicker">ACTIVITY</span>

                  <h2>
                    Notifications
                    {unreadCount > 0 && (
                      <span className="notification-count">
                        {unreadCount}
                      </span>
                    )}
                  </h2>
                </div>

                {unreadCount > 0 && (
                  <button
                    className="mark-read-button"
                    onClick={markAllRead}
                  >
                    Mark read
                  </button>
                )}
              </div>

              {notificationsError ? (
                <p className="notifications-error" role="alert">
                  {notificationsError}
                </p>
              ) : notifications.length === 0 ? (
                <div className="notifications-empty">
                  <div>🔔</div>
                  <strong>No notifications</strong>
                  <span>
                    Shipment scan and delivery activity will appear here.
                  </span>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`notification-item ${
                        notification.isRead ? 'read' : 'unread'
                      }`}
                    >
                      <div className="notification-dot" />

                      <div className="notification-content">
                        <p>{getText(notification.message, 'Notification message unavailable.')}</p>

                        <span>
                          {notification.createdAt
                            ? new Date(
                                notification.createdAt
                              ).toLocaleString()
                            : 'Unknown time'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </Card>

            {/* Dashboard note */}
            <div className="dashboard-note">
              <div className="dashboard-note-icon">◎</div>

              <div>
                <strong>Scan-based tracking</strong>

                <p>
                  TrashTrace records where a QR code was scanned.
                  It does not continuously track the physical package.
                </p>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;