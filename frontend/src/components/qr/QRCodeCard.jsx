import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Button, Card, CardBody } from '../ui';

const QRCodeCard = ({
  trackingId,
  trackingUrl,
  trashType,
  destination,
}) => {
  const qrRef = useRef(null);

  const downloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const image = new Image();

    image.onload = () => {
      const padding = 40;

      canvas.width = image.width + padding;
      canvas.height = image.height + padding;

      context.fillStyle = '#ffffff';

      context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        padding / 2,
        padding / 2
      );

      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');

      downloadLink.download =
        `TrashTrace-${trackingId}.png`;

      downloadLink.href = pngFile;

      downloadLink.click();
    };

    image.src =
      'data:image/svg+xml;base64,' +
      btoa(
        unescape(
          encodeURIComponent(svgData)
        )
      );
  };

  const printQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');

    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    const printWindow = window.open(
      '',
      '',
      'height=700,width=800'
    );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <title>
            TrashTrace QR - ${trackingId}
          </title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              min-height: 100vh;

              display: flex;
              align-items: center;
              justify-content: center;

              font-family:
                Inter,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

              background: #f5f7f4;
              color: #17201a;
            }

            .sheet {
              width: 100%;
              max-width: 620px;

              padding: 48px;

              text-align: center;

              background: #ffffff;
            }

            .brand {
              margin-bottom: 28px;

              color: #2f7d4a;

              font-size: 14px;
              font-weight: 800;

              letter-spacing: 0.12em;
              text-transform: uppercase;
            }

            h1 {
              margin: 0 0 8px;

              font-size: 30px;
            }

            .tracking {
              margin-bottom: 28px;

              color: #667168;
            }

            .qr {
              display: inline-block;

              padding: 24px;

              background: #ffffff;

              border: 1px solid #e0e6e1;

              border-radius: 16px;
            }

            .details {
              margin-top: 28px;
              padding-top: 24px;

              border-top: 1px solid #e0e6e1;

              text-align: left;
            }

            .detail {
              margin-bottom: 12px;
            }

            .label {
              color: #667168;

              font-size: 12px;
              font-weight: 600;

              letter-spacing: 0.08em;
              text-transform: uppercase;
            }

            .value {
              margin-top: 4px;

              font-size: 15px;
              font-weight: 600;
            }

            @media print {
              body {
                background: #ffffff;
              }

              .sheet {
                max-width: none;
              }
            }
          </style>
        </head>

        <body>

          <div class="sheet">

            <div class="brand">
              TrashTrace
            </div>

            <h1>
              Waste Shipment
            </h1>

            <div class="tracking">
              Tracking ID:
              <strong>${trackingId}</strong>
            </div>

            <div class="qr">
              ${svgData}
            </div>

            <div class="details">

              <div class="detail">
                <div class="label">
                  Waste type
                </div>

                <div class="value">
                  ${trashType}
                </div>
              </div>

              <div class="detail">
                <div class="label">
                  Destination
                </div>

                <div class="value">
                  ${destination}
                </div>
              </div>

            </div>

          </div>

        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Card className="qr-card">

      <CardBody>

        <div className="qr-card-header">

          <span className="eyebrow">
            PACKAGE QR
          </span>

          <h2>
            Scan to track
          </h2>

          <p>
            Anyone scanning this code can open the
            shipment tracking page.
          </p>

        </div>

        <div
          className="qr-wrapper"
          ref={qrRef}
        >
          <QRCodeSVG
            value={trackingUrl}
            size={240}
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="tracking-id">

          <span>
            Tracking ID
          </span>

          <strong>
            {trackingId}
          </strong>

        </div>

        <div className="qr-actions">

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
            Print QR
          </Button>

        </div>

      </CardBody>

    </Card>
  );
};

export default QRCodeCard;