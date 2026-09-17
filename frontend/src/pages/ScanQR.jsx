import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const ScanQR = () => {
  const [error, setError] = useState('');
  const [hasCameraPerm, setHasCameraPerm] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          setHasCameraPerm(true);
          html5QrCode = new Html5Qrcode("reader");
          
          await html5QrCode.start(
            { facingMode: "environment" }, // Prefer back camera
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
              // Extract tracking ID if it's a full URL
              let trackingId = decodedText;
              
              if (decodedText.includes('/track/')) {
                const parts = decodedText.split('/track/');
                trackingId = parts[1];
              }

              if (trackingId) {
                // Stop scanner
                html5QrCode.stop().then(() => {
                  // Navigate to track page
                  navigate(`/track/${trackingId}`);
                }).catch(err => console.error("Error stopping scanner", err));
              }
            },
            (errorMessage) => {
              // parse errors are ignored as it just means no QR detected yet
            }
          );
          scannerRef.current = html5QrCode;
        } else {
          setError('No cameras found on your device.');
        }
      } catch (err) {
        setError('Camera permission denied or camera unavailable.');
        console.error(err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [navigate]);

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '1rem' }}>Scan Package QR</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Point your camera at the TrashTrace QR code on the package.
      </p>

      {error ? (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      ) : (
        <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', overflow: 'hidden', borderRadius: '1rem' }}></div>
      )}

      {!hasCameraPerm && !error && (
        <p style={{ marginTop: '1rem' }}>Requesting camera access...</p>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', textDecoration: 'none' }}>
          Cancel Scanning
        </Link>
      </div>
    </div>
  );
};

export default ScanQR;
