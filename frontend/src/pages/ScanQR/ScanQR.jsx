import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

import Button from '../../components/ui/Button';

import './scan-qr.css';

const ScanQR = () => {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const hasNavigatedRef = useRef(false);

  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    let html5QrCode;
    let mounted = true;

    const startScanner = async () => {
      try {
        setIsStarting(true);
        setError('');

        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          throw new Error('No camera was found on this device.');
        }

        if (!mounted) return;

        html5QrCode = new Html5Qrcode('trashtrace-qr-reader');

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
            aspectRatio: 1,
          },
          async (decodedText) => {
            if (hasNavigatedRef.current) return;

            let trackingId = decodedText.trim();

            if (decodedText.includes('/track/')) {
              const parts = decodedText.split('/track/');
              trackingId = parts[1]?.split(/[?#]/)[0] || '';
            }

            if (!trackingId) {
              return;
            }

            hasNavigatedRef.current = true;

            try {
              await html5QrCode.stop();
            } catch (stopError) {
              console.error('Error stopping QR scanner:', stopError);
            }

            navigate(`/track/${trackingId}`);
          },
          () => {
            // QR parse failures are expected while the camera
            // is searching for a valid QR code.
          }
        );

        if (mounted) {
          scannerRef.current = html5QrCode;
          setCameraReady(true);
          setIsStarting(false);
        }
      } catch (err) {
        console.error('QR scanner error:', err);

        if (!mounted) return;

        setIsStarting(false);
        setCameraReady(false);

        if (err.message?.toLowerCase().includes('permission')) {
          setError(
            'Camera permission was denied. Allow camera access and try again.'
          );
        } else {
          setError(
            err.message || 'Camera could not be started.'
          );
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;

      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, [navigate]);

  return (
    <main className="scan-page">
      <div className="scan-container">

        {/* Header */}
        <section className="scan-header">
          <Link to="/" className="scan-back-link">
            ← Back
          </Link>

          <span className="eyebrow">QR SCANNER</span>

          <h1>
            Scan a <span>TrashTrace</span> package
          </h1>

          <p>
            Point your camera at the QR code attached to the
            waste package. We'll take you directly to its
            tracking page.
          </p>
        </section>

        {/* Scanner */}
        <section className="scanner-card">

          <div className="scanner-topbar">
            <div className="scanner-status">
              <span
                className={`scanner-status-dot ${
                  cameraReady ? 'is-ready' : ''
                }`}
              />

              <span>
                {cameraReady
                  ? 'Camera ready'
                  : isStarting
                    ? 'Starting camera...'
                    : 'Camera unavailable'}
              </span>
            </div>

            <span className="scanner-secure">
              Camera stays in your browser
            </span>
          </div>

          <div className="scanner-view">

            {error ? (
              <div className="scanner-error">

                <div className="scanner-error-icon">
                  !
                </div>

                <h2>Camera unavailable</h2>

                <p>{error}</p>

                <Button
                  onClick={() => window.location.reload()}
                >
                  Try again
                </Button>

              </div>
            ) : (
              <>
                <div
                  id="trashtrace-qr-reader"
                  className="qr-reader"
                />

                {/* Scanning frame */}
                <div className="scanner-frame">

                  <span className="scanner-corner scanner-corner-tl" />
                  <span className="scanner-corner scanner-corner-tr" />
                  <span className="scanner-corner scanner-corner-bl" />
                  <span className="scanner-corner scanner-corner-br" />

                  <span className="scanner-line" />

                </div>

                {isStarting && (
                  <div className="scanner-overlay">
                    <div className="scanner-spinner" />
                    <span>Requesting camera access...</span>
                  </div>
                )}

              </>
            )}

          </div>

          {!error && (
            <div className="scanner-instruction">
              <div className="scanner-instruction-icon">
                ⌗
              </div>

              <div>
                <strong>Align the QR code inside the frame</strong>

                <p>
                  Keep the code visible and steady until it
                  is detected automatically.
                </p>
              </div>
            </div>
          )}

        </section>

        {/* How it works */}
        <section className="scan-how-it-works">

          <div className="scan-section-heading">
            <span className="eyebrow">WHAT HAPPENS NEXT</span>
            <h2>From QR code to tracking</h2>
          </div>

          <div className="scan-steps">

            <div className="scan-step">
              <span>01</span>
              <div>
                <h3>Scan</h3>
                <p>
                  Your camera reads the package's unique QR code.
                </p>
              </div>
            </div>

            <div className="scan-step">
              <span>02</span>
              <div>
                <h3>Identify</h3>
                <p>
                  TrashTrace extracts the package tracking ID.
                </p>
              </div>
            </div>

            <div className="scan-step">
              <span>03</span>
              <div>
                <h3>Track</h3>
                <p>
                  You are taken to the shipment's tracking page.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Manual alternative */}
        <section className="scan-manual">

          <div>
            <span className="eyebrow">NO CAMERA?</span>

            <h2>Have a tracking ID?</h2>

            <p>
              You can open a tracking link directly instead of
              scanning the QR code.
            </p>
          </div>

          <Link
            to="/"
            className="scan-manual-link"
          >
            Go to homepage →
          </Link>

        </section>

      </div>
    </main>
  );
};

export default ScanQR;