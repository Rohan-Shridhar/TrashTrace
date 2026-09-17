import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ trackingId, trackingUrl, trashType, destination }) => {
  const qrRef = useRef(null);

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width + 40; // padding
      canvas.height = img.height + 40;
      
      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR code
      ctx.drawImage(img, 20, 20);
      
      // Trigger download
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `TrashTrace-${trackingId}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const printQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print QR</title>');
    printWindow.document.write('<style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>TrashTrace</h1>');
    printWindow.document.write(`<h2>ID: ${trackingId}</h2>`);
    printWindow.document.write(`<h3>Type: ${trashType} | Dest: ${destination}</h3>`);
    printWindow.document.write(`<div style="margin-top: 20px;">${svgData}</div>`);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div 
        ref={qrRef} 
        style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '1rem',
          display: 'inline-block',
          marginBottom: '1.5rem'
        }}
      >
        <QRCodeSVG 
          value={trackingUrl} 
          size={256}
          level="H"
          includeMargin={false}
        />
      </div>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--success-color)' }}>Tracking ID: {trackingId}</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Attach this QR code to the package.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={downloadQR} className="btn" style={{ flex: 1, backgroundColor: '#475569' }}>
          Download QR
        </button>
        <button onClick={printQR} className="btn" style={{ flex: 1 }}>
          Print QR
        </button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
