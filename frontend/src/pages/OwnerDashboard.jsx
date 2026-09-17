import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerToken } from '../utils/owner';

const getStatusBadgeClass = (status) => {
  if (status === 'CREATED') return 'badge badge-created';
  if (status === 'IN_TRANSIT') return 'badge badge-transit';
  if (status === 'DELIVERED') return 'badge badge-delivered';
  return 'badge';
};

const OwnerDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ownerToken = getOwnerToken();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgsRes, notifsRes] = await Promise.all([
        fetch(`/api/trash/owner/${ownerToken}`),
        fetch(`/api/notifications/${ownerToken}`),
      ]);
      if (!pkgsRes.ok) throw new Error('Failed to fetch your packages.');
      setPackages(await pkgsRes.json());
      setNotifications(notifsRes.ok ? await notifsRes.json() : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const markAllRead = async () => {
    await fetch(`/api/notifications/${ownerToken}/read`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="loading-center">
      <div className="loader" />
      <p>Loading your dashboard…</p>
    </div>
  );

  return (
    <div className="container fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>My Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Packages registered from this device</p>
        </div>
        <Link to="/create" className="btn" style={{ textDecoration: 'none' }}>+ New Shipment</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '2rem', alignItems: 'start' }}>
        {/* Packages */}
        <div>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>My Packages <span style={{ color: 'var(--text-secondary)', fontWeight: '400' }}>({packages.length})</span></h2>

          {packages.length === 0 ? (
            <div className="card empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
              <h3>No packages yet</h3>
              <p style={{ marginBottom: '1.5rem' }}>Create your first waste shipment to get a tracking QR code.</p>
              <Link to="/create" className="btn" style={{ textDecoration: 'none' }}>Create Shipment</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {packages.map(pkg => (
                <div key={pkg._id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <strong>{pkg.trashType}</strong>
                      <span className={getStatusBadgeClass(pkg.status)}>{pkg.status.replace('_', ' ')}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
                      {pkg.trackingId}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      → {pkg.destination.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Created {new Date(pkg.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Link to={`/track/${pkg.trackingId}`} className="btn btn-ghost" style={{ textDecoration: 'none', flexShrink: 0 }}>
                    Track →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications sidebar */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ background: 'var(--error-color)', color: 'white', borderRadius: '999px', padding: '0.1rem 0.45rem', fontSize: '0.75rem', fontWeight: '700' }}>
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>
              <p style={{ fontSize: '0.9rem' }}>All caught up! 🎉</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
              {notifications.map(notif => (
                <div key={notif._id} style={{
                  padding: '0.9rem 1rem',
                  borderRadius: '0.625rem',
                  background: notif.isRead ? 'rgba(0,0,0,0.15)' : 'rgba(59,130,246,0.08)',
                  borderLeft: `3px solid ${notif.type === 'DELIVERED' ? 'var(--success-color)' : 'var(--primary-color)'}`,
                  opacity: notif.isRead ? 0.65 : 1,
                }}>
                  <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem', lineHeight: 1.5 }}>{notif.message}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
