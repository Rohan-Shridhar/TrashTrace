import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import './qr-code-card.css';

const QRCodeCard = ({
  trackingId,
  trackingUrl,
  trashType,
  destination,
}) => {
  const qrRef = useRef(null);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');

    if (!svg) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    const svgBlob = new Blob([source], {
      type: 'image/svg+xml;charset=utf-8',
    });

    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const padding = 80;

      canvas.width = image.width + padding * 2;
      canvas.height = image.height + padding * 2;

      const context = canvas.getContext('2d');

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.drawImage(
        image,
        padding,
        padding
      );

      URL.revokeObjectURL(url);

      const downloadLink = document.createElement('a');
      downloadLink.download = `trashtrace-${trackingId}.png`;
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.click();
    };

    image.src = url;
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank', 'width=700,height=800');

    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TrashTrace - ${trackingId}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: Arial, sans-serif;
              background: #ffffff;
              color: #111827;
            }

            .label {
              width: 100%;
              max-width: 520px;
              margin: 0 auto;
              border: 2px solid #111827;
              border-radius: 18px;
              padding: 32px;
            }

            .brand {
              font-size: 20px;
              font-weight: 800;
              letter-spacing: -0.04em;
              margin-bottom: 4px;
            }

            .eyebrow {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: #6b7280;
              margin-bottom: 24px;
            }

            .qr {
              display: flex;
              justify-content: center;
              margin: 10px 0 28px;
            }

            .tracking {
              text-align: center;
              font-size: 28px;
              font-weight: 800;
              letter-spacing: 0.08em;
              margin-bottom: 28px;
            }

            .row {
              border-top: 1px solid #e5e7eb;
              padding: 14px 0;
            }

            .label-name {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #6b7280;
              margin-bottom: 5px;
            }

            .value {
              font-size: 15px;
              font-weight: 600;
            }

            .footer {
              border-top: 1px solid #e5e7eb;
              margin-top: 20px;
              padding-top: 18px;
              font-size: 11px;
              color: #6b7280;
              line-height: 1.5;
            }

            @media print {
              body {
                padding: 0;
              }

              .label {
                border: 2px solid #111827;
              }
            }
          </style>
        </head>

        <body>
          <div class="label">
            <div class="brand">TrashTrace</div>

            <div class="eyebrow">
              Digital shipment label
            </div>

            <div class="qr">
              ${qrRef.current?.innerHTML || ''}
            </div>

            <div class="tracking">
              ${trackingId}
            </div>

            <div class="row">
              <div class="label-name">Waste type</div>
              <div class="value">${trashType || 'Not specified'}</div>
            </div>

            <div class="row">
              <div class="label-name">Destination</div>
              <div class="value">${destination || 'Not specified'}</div>
            </div>

            <div class="footer">
              Scan this QR code to open the TrashTrace shipment page.
              TrashTrace records QR scan locations; it does not continuously
              track the physical package.
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <Card className="qr-card">
      <CardBody>

        <div className="qr-card__header">
          <div>
            <span className="qr-card__eyebrow">
              PACKAGE IDENTITY
            </span>

            <h2 className="qr-card__title">
              Your shipment is ready
            </h2>

            <p className="qr-card__subtitle">
              Attach this label to the package and scan it to open
              its tracking page.
            </p>
          </div>

          <div className="qr-card__status">
            <span className="qr-card__status-dot" />
            Created
          </div>
        </div>

        <div className="qr-card__label">

          <div className="qr-card__brand-row">
            <div className="qr-card__mini-brand">
              <span className="qr-card__logo">T</span>

              <span>TrashTrace</span>
            </div>

            <span className="qr-card__label-type">
              DIGITAL SHIPMENT
            </span>
          </div>

          <div className="qr-card__main">

            <div
              ref={qrRef}
              className="qr-card__qr"
              aria-label={`QR code for shipment ${trackingId}`}
            >
              <QRCodeSVG
                value={trackingUrl}
                size={220}
                level="H"
                includeMargin
              />
            </div>

            <div className="qr-card__details">

              <div className="qr-card__tracking-label">
                TRACKING ID
              </div>

              <div className="qr-card__tracking-id">
                {trackingId}
              </div>

              <div className="qr-card__scan-hint">
                Scan to open shipment tracking
              </div>

              <div className="qr-card__divider" />

              <div className="qr-card__meta">
                <span className="qr-card__meta-label">
                  WASTE TYPE
                </span>

                <strong>
                  {trashType || 'Not specified'}
                </strong>
              </div>

              <div className="qr-card__meta">
                <span className="qr-card__meta-label">
                  DESTINATION
                </span>

                <strong>
                  {destination || 'Not specified'}
                </strong>
              </div>

            </div>
          </div>

          <div className="qr-card__route">
            <span className="qr-card__route-point">
              <span className="qr-card__route-dot" />
              Shipment created
            </span>

            <span className="qr-card__route-line" />

            <span className="qr-card__route-point">
              <span className="qr-card__route-dot qr-card__route-dot--destination" />
              Destination
            </span>
          </div>

        </div>

        <div className="qr-card__actions">

          <Button
            variant="secondary"
            onClick={downloadQR}
          >
            Download QR
          </Button>

          <Button
            variant="primary"
            onClick={printQR}
          >
            Print label
          </Button>

        </div>

        <div className="qr-card__notice">
          <span className="qr-card__notice-icon">i</span>

          <p>
            TrashTrace records the locations where this QR code is
            scanned. It does not continuously track the physical
            movement of the package.
          </p>
        </div>

      </CardBody>
    </Card>
  );
};

export default QRCodeCard;