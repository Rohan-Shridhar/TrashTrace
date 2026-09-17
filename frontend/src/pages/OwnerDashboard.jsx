import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerToken } from '../utils/owner';

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
        fetch(`/api/notifications/${ownerToken}`)
      ]);
      
      if (!pkgsRes.ok || !notifsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      setPackages(await pkgsRes.json());
      setNotifications(await notifsRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ownerToken]);

  const markNotificationsRead = async () => {
    try {
      await fetch(`/api/notifications/${ownerToken}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications read', err);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'CREATED') return 'var(--primary-color)';
    if (status === 'IN_TRANSIT') return '#f59e0b';
    if (status === 'DELIVERED') return 'var(--success-color)';
    return 'white';
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="header" style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>My Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your tracked shipments</p>
        </div>
        <Link to="/create" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>
          + New Shipment
        </Link>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Packages List */}
        <div>
          <h2 style={{ marginBottom: '1rem' }}>My Packages ({packages.length})</h2>
          
          {packages.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No packages yet</h3>
              <Link to="/create" className="btn" style={{ textDecoration: 'none' }}>Create your first shipment</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {packages.map(pkg => (
                <div key={pkg._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {pkg.trashType}
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '999px',
                        backgroundColor: getStatusColor(pkg.status) + '20',
                        color: getStatusColor(pkg.status),
                        border: `1px solid ${getStatusColor(pkg.status)}`
                      }}>
                        {pkg.status.replace('_', ' ')}
                      </span>
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      ID: {pkg.trackingId}
                    </p>
                    <p style={{ fontSize: '0.9rem' }}>
                      To: {pkg.destination.name}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/track/${pkg.trackingId}`} className="btn" style={{ textDecoration: 'none', backgroundColor: 'transparent', border: '1px solid var(--primary-color)' }}>
                      Track
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Sidebar */}
        <div className="card" style={{ padding: '1.5rem', backgroundColor: 'rgba(30, 41, 59, 0.9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.8rem' }}>
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markNotificationsRead} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.9rem' }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>You're all caught up!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
              {notifications.map(notif => (
                <div key={notif._id} style={{ 
                  padding: '1rem', 
                  backgroundColor: notif.isRead ? 'rgba(0,0,0,0.2)' : 'rgba(59, 130, 246, 0.1)',
                  borderLeft: `3px solid ${notif.type === 'DELIVERED' ? 'var(--success-color)' : 'var(--primary-color)'}`,
                  borderRadius: '0 0.5rem 0.5rem 0'
                }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem', color: notif.isRead ? 'var(--text-secondary)' : 'white' }}>
                    {notif.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OwnerDashboard;
