import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import Button from "../../components/ui/Button";
import "./home.css";

const PRESET_SHIPMENTS = [
  {
    id: "TT-BIO-9021",
    type: "Organic Compost & Biomass",
    source: "Metro Food Terminal, Dock 4",
    destination: "BioCycle Digester Facility",
    coordinates: "40.7128° N, 74.0060° W",
    status: "In Transit",
    distanceRemaining: "420 m",
    scansCount: 3,
    progress: 72,
    tag: "COMPOSTABLE",
  },
  {
    id: "TT-LITH-4402",
    type: "Lithium-Ion Battery Cells",
    source: "GreenTech E-Waste Hub",
    destination: "Apex Metal Refiners",
    coordinates: "37.7749° N, 122.4194° W",
    status: "Delivered",
    distanceRemaining: "12 m (Verified)",
    scansCount: 5,
    progress: 100,
    tag: "HAZMAT / RECYCLE",
  },
  {
    id: "TT-PET-7719",
    type: "Ocean-Bound Recycled Polymers",
    source: "Harbor Clean Sorting Bay",
    destination: "PurePolymer Processing Plant",
    coordinates: "34.0522° N, 118.2437° W",
    status: "Dispatched",
    distanceRemaining: "3.4 km",
    scansCount: 1,
    progress: 25,
    tag: "CIRCULAR PET",
  },
];

const WORKFLOW_STEPS = [
  {
    number: "01",
    label: "REGISTRATION",
    title: "Create a shipment",
    description:
      "Register waste type, starting coordinates, and configure the certified destination geofence radius in seconds.",
  },
  {
    number: "02",
    label: "LABELING",
    title: "Affix the QR code",
    description:
      "Generate an instant high-density QR label. Attach it physically to bins, drums, crates, or intermodal pallets.",
  },
  {
    number: "03",
    label: "WAYPOINT LOGS",
    title: "Scan along the route",
    description:
      "Every handler scans the package using standard phone cameras. GPS coordinates and timestamps are immutably logged.",
  },
  {
    number: "04",
    label: "VERIFICATION",
    title: "Verify destination",
    description:
      "When a scan falls within the authorized geofence radius, delivery is cryptographically verified and certified.",
  },
];

function Home() {
  const navigate = useNavigate();

  // Hero interactive simulation state
  const [heroSimStep, setHeroSimStep] = useState(1);
  const [heroSimFeedback, setHeroSimFeedback] = useState("");

  // Sandbox interactive selected shipment
  const [selectedPreset, setSelectedPreset] = useState(PRESET_SHIPMENTS[0]);
  const [footerTrackingId, setFooterTrackingId] = useState("");

  const handleSimulateScan = () => {
    if (heroSimStep === 1) {
      setHeroSimStep(2);
      setHeroSimFeedback("Waypoint scan logged at Transfer Hub #2 (GPS ±2m)");
    } else if (heroSimStep === 2) {
      setHeroSimStep(3);
      setHeroSimFeedback("Arrival scan inside 500m geofence: Destination Verified!");
    } else {
      setHeroSimStep(1);
      setHeroSimFeedback("Simulation reset to initial transit dispatch.");
    }
  };

  const handleFooterTrack = (e) => {
    e.preventDefault();
    const cleanId = footerTrackingId.trim();
    if (cleanId) {
      navigate(`/track/${cleanId}`);
    } else {
      navigate(`/track/${selectedPreset.id}`);
    }
  };

  return (
    <div className="begg-home">
      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <section className="begg-hero">
        {/* Floating Organic Chemistry/Vitamin-style Badges (b-egg signature) */}
        <div className="begg-floating-bubble bubble-gps" aria-hidden="true">
          <span>GPS</span>
          <small>±3M</small>
        </div>
        <div className="begg-floating-bubble bubble-qr" aria-hidden="true">
          <span>QR</span>
          <small>FAST</small>
        </div>
        <div className="begg-floating-bubble bubble-eco" aria-hidden="true">
          <span>100%</span>
          <small>TRACE</small>
        </div>

        <div className="begg-container begg-hero-grid">
          {/* Left Column: Bold Typography */}
          <div className="begg-hero-text">
            <div className="begg-tag-pill">
              <span className="begg-tag-dot" />
              <span>CIRCULAR SUPPLY CHAIN // REAL-TIME GPS VERIFICATION</span>
            </div>

            <h1 className="begg-hero-h1">
              <span className="begg-h1-line">a new look</span>
              <span className="begg-h1-line">at waste</span>
              <span className="begg-h1-line begg-highlight">logistics.</span>
            </h1>

            <p className="begg-hero-p">
              TrashTrace transforms physical waste consignments into auditable,
              QR-verified custody trails. From collection dock to certified
              recycling centers — without costly hardware or complex software.
            </p>

            <div className="begg-hero-cta-row">
              <Link to="/create">
                <Button size="lg" className="begg-btn-primary">
                  Create a shipment
                  <span className="begg-btn-arrow">→</span>
                </Button>
              </Link>

              <Link to="/scan">
                <Button variant="secondary" size="lg" className="begg-btn-secondary">
                  <i className="fa-solid fa-qrcode" aria-hidden="true" />
                  Scan package
                </Button>
              </Link>
            </div>

            <div className="begg-hero-specs-bar">
              <div className="begg-spec-item">
                <strong>0%</strong>
                <span>Lost consignments</span>
              </div>
              <div className="begg-spec-divider" />
              <div className="begg-spec-item">
                <strong>&lt; 1s</strong>
                <span>Instant QR scan</span>
              </div>
              <div className="begg-spec-divider" />
              <div className="begg-spec-item">
                <strong>500m</strong>
                <span>Geofence verification</span>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Parcel / Interactive Tracking Centerpiece */}
          <div className="begg-hero-visual">
            <div className="begg-parcel-card">
              {/* Top Bar */}
              <div className="begg-parcel-header">
                <div className="begg-parcel-id-block">
                  <span className="begg-label-mono">SHIPMENT ID</span>
                  <span className="begg-mono-id">TT-8842-BIO</span>
                </div>

                <div
                  className={`begg-status-pill ${
                    heroSimStep === 3 ? "begg-status-verified" : "begg-status-transit"
                  }`}
                >
                  <span className="begg-status-dot" />
                  {heroSimStep === 3 ? "Delivered & Verified" : "In Transit"}
                </div>
              </div>

              {/* QR Code and Cargo Info */}
              <div className="begg-parcel-body">
                <div className="begg-qr-container">
                  <div className="begg-qr-frame">
                    <QRCodeSVG
                      value={`https://trashtrace.internal/track/TT-8842-BIO`}
                      size={130}
                      level="M"
                      fgColor="#191200"
                      bgColor="#ffffff"
                    />
                  </div>
                  <span className="begg-qr-subtext">SCAN WITH ANY SMARTPHONE</span>
                </div>

                <div className="begg-parcel-meta">
                  <div className="begg-meta-row">
                    <span className="begg-meta-label">CARGO TYPE</span>
                    <strong className="begg-meta-val">Organic Compost Waste</strong>
                  </div>

                  <div className="begg-meta-row">
                    <span className="begg-meta-label">LAST GPS SCAN</span>
                    <span className="begg-meta-val begg-mono">
                      {heroSimStep === 1 && "40.7128° N, 74.0060° W"}
                      {heroSimStep === 2 && "40.7306° N, 73.9352° W"}
                      {heroSimStep === 3 && "40.7589° N, 73.9851° W (MATCH)"}
                    </span>
                  </div>

                  <div className="begg-meta-row">
                    <span className="begg-meta-label">WAYPOINT PROGRESS</span>
                    <div className="begg-progress-track">
                      <div
                        className="begg-progress-bar"
                        style={{
                          width:
                            heroSimStep === 1 ? "30%" : heroSimStep === 2 ? "65%" : "100%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Waypoint Route Strip */}
              <div className="begg-route-strip">
                <div className="begg-route-node">
                  <span className="begg-node-point active">01</span>
                  <div>
                    <strong>Dock 4</strong>
                    <small>Dispatched</small>
                  </div>
                </div>

                <div className={`begg-route-line ${heroSimStep >= 2 ? "active" : ""}`} />

                <div className="begg-route-node">
                  <span className={`begg-node-point ${heroSimStep >= 2 ? "active" : ""}`}>
                    02
                  </span>
                  <div>
                    <strong>Hub Transfer</strong>
                    <small>{heroSimStep >= 2 ? "Scanned" : "En route"}</small>
                  </div>
                </div>

                <div className={`begg-route-line ${heroSimStep === 3 ? "active" : ""}`} />

                <div className="begg-route-node">
                  <span className={`begg-node-point ${heroSimStep === 3 ? "active" : ""}`}>
                    03
                  </span>
                  <div>
                    <strong>BioCycle Plant</strong>
                    <small>{heroSimStep === 3 ? "Verified" : "Target"}</small>
                  </div>
                </div>
              </div>

              {/* Interactive Simulation Footer */}
              <div className="begg-parcel-footer">
                <button
                  type="button"
                  className="begg-sim-btn"
                  onClick={handleSimulateScan}
                >
                  <i className="fa-solid fa-satellite-dish" aria-hidden="true" />
                  <span>
                    {heroSimStep === 1 && "Simulate Waypoint Scan →"}
                    {heroSimStep === 2 && "Simulate Destination Scan →"}
                    {heroSimStep === 3 && "Reset Demo Route ↺"}
                  </span>
                </button>

                {heroSimFeedback && (
                  <p className="begg-sim-feedback">{heroSimFeedback}</p>
                )}
              </div>
            </div>

            {/* Floating Mini Sticker Card */}
            <div className="begg-float-sticker">
              <span className="begg-float-icon">✓</span>
              <div>
                <strong>Tamper-Evident Trail</strong>
                <small>Immutable GPS logs</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          INFINITE MARQUEE TICKER (b-egg signature ribbon)
          ======================================================== */}
      <div className="begg-ticker-wrap" aria-hidden="true">
        <div className="begg-ticker">
          <span className="begg-ticker-item">★ REAL-TIME QR VERIFICATION</span>
          <span className="begg-ticker-item">● ZERO PAPER WASTE</span>
          <span className="begg-ticker-item">★ GPS RADIUS PROOF</span>
          <span className="begg-ticker-item">● AUDITABLE CHAIN OF CUSTODY</span>
          <span className="begg-ticker-item">★ 100% VISIBILITY</span>
          <span className="begg-ticker-item">● CIRCULAR RECOVERY</span>
          {/* Duplicate set for seamless continuous marquee */}
          <span className="begg-ticker-item">★ REAL-TIME QR VERIFICATION</span>
          <span className="begg-ticker-item">● ZERO PAPER WASTE</span>
          <span className="begg-ticker-item">★ GPS RADIUS PROOF</span>
          <span className="begg-ticker-item">● AUDITABLE CHAIN OF CUSTODY</span>
          <span className="begg-ticker-item">★ 100% VISIBILITY</span>
          <span className="begg-ticker-item">● CIRCULAR RECOVERY</span>
        </div>
      </div>

      {/* ========================================================
          ENERGY VALUE / TRACE METRICS SECTION (b-egg homage)
          ======================================================== */}
      <section className="begg-metrics-section">
        <div className="begg-container">
          <div className="begg-metrics-header">
            <span className="begg-section-badge">VERIFIED SPECIFICATIONS</span>
            <h2 className="begg-h2">Trace metrics</h2>
            <p className="begg-metrics-sub">
              Engineered for absolute certainty across transport, sorting, and disposal.
            </p>
          </div>

          <div className="begg-metrics-grid">
            <div className="begg-metric-pill">
              <span className="begg-metric-name">DISPATCH LATENCY</span>
              <span className="begg-metric-val">&lt; 0.8 SEC</span>
            </div>

            <div className="begg-metric-pill highlight">
              <span className="begg-metric-name">GEOFENCE ACCURACY</span>
              <span className="begg-metric-val">500 METERS</span>
            </div>

            <div className="begg-metric-pill">
              <span className="begg-metric-name">GPS AUDITABILITY</span>
              <span className="begg-metric-val">100% VERIFIED</span>
            </div>

            <div className="begg-metric-pill">
              <span className="begg-metric-name">APP OVERHEAD</span>
              <span className="begg-metric-val">0 DOWNLOADS</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3 SIGNATURE SPEC CARDS (b-egg easy / compact / quality)
          ======================================================== */}
      <section className="begg-spec-cards-section">
        <div className="begg-container">
          <div className="begg-cards-grid">
            {/* Card 1: Easy */}
            <div className="begg-card">
              <div className="begg-card-top">
                <span className="begg-card-wordmark">easy</span>
                <span className="begg-card-number">01</span>
              </div>

              <div className="begg-card-content">
                <h3 className="begg-card-title">1-Sec QR Scan</h3>
                <span className="begg-card-spec-tag">CAMERA-NATIVE // ZERO INSTALL</span>
                <p className="begg-card-desc">
                  Every driver, facility worker, and transfer station operator scans
                  instantly using their regular phone camera or browser. No bulky
                  handheld terminals or login walls.
                </p>
              </div>

              <div className="begg-card-footer">
                <div className="begg-card-stat">
                  <strong>&lt; 1s</strong>
                  <span>Scan logging speed</span>
                </div>
                <div className="begg-card-pill-btn">
                  <i className="fa-solid fa-bolt" />
                </div>
              </div>
            </div>

            {/* Card 2: Compact */}
            <div className="begg-card highlight-card">
              <div className="begg-card-top">
                <span className="begg-card-wordmark">compact</span>
                <span className="begg-card-number">02</span>
              </div>

              <div className="begg-card-content">
                <h3 className="begg-card-title">Universal Label</h3>
                <span className="begg-card-spec-tag">SCALABLE // 150×325 MM & BINS</span>
                <p className="begg-card-desc">
                  Weatherproof, high-contrast QR labels that stick firmly to
                  biohazard totes, chemical drums, recycling gaylords, and intermodal
                  bulk cargo containers.
                </p>
              </div>

              <div className="begg-card-footer">
                <div className="begg-card-stat">
                  <strong>100%</strong>
                  <span>Standard label compatibility</span>
                </div>
                <div className="begg-card-pill-btn">
                  <i className="fa-solid fa-expand" />
                </div>
              </div>
            </div>

            {/* Card 3: Quality */}
            <div className="begg-card">
              <div className="begg-card-top">
                <span className="begg-card-wordmark">quality</span>
                <span className="begg-card-number">03</span>
              </div>

              <div className="begg-card-content">
                <h3 className="begg-card-title">Geofence Proof</h3>
                <span className="begg-card-spec-tag">DESTINATION VALIDATION // NO GUESSWORK</span>
                <p className="begg-card-desc">
                  TrashTrace runs automated Haversine geodetic distance calculations
                  on arrival scans to mathematically certify delivery inside the
                  authorized facility perimeter.
                </p>
              </div>

              <div className="begg-card-footer">
                <div className="begg-card-stat">
                  <strong>± 3m</strong>
                  <span>GPS precision match</span>
                </div>
                <div className="begg-card-pill-btn">
                  <i className="fa-solid fa-shield-halved" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          WORKFLOW SECTION (01 - 04 numbered mask cards)
          ======================================================== */}
      <section className="begg-workflow-section">
        <div className="begg-container">
          <div className="begg-workflow-heading">
            <div>
              <span className="begg-section-badge">HOW IT WORKS</span>
              <h2 className="begg-h2">From package to destination.</h2>
            </div>
            <p className="begg-workflow-desc">
              Four straightforward steps provide frictionless visibility without
              administrative friction.
            </p>
          </div>

          <div className="begg-workflow-grid">
            {WORKFLOW_STEPS.map((step) => (
              <div key={step.number} className="begg-workflow-card">
                <div className="begg-workflow-num-row">
                  <span className="begg-workflow-num">{step.number}</span>
                  <span className="begg-workflow-tag">{step.label}</span>
                </div>

                <h3 className="begg-workflow-step-title">{step.title}</h3>
                <p className="begg-workflow-step-desc">{step.description}</p>

                <div className="begg-step-indicator">
                  <span className="begg-indicator-bar" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          DARK CONTRAST TRUST / STATEMENT SECTION (b-egg signature)
          ======================================================== */}
      <section className="begg-trust-section">
        <div className="begg-container">
          <div className="begg-trust-box">
            <div className="begg-trust-tag-row">
              <span className="begg-yolk-dot" />
              <span className="begg-trust-label">TRANSPARENCY STANDARD</span>
            </div>

            <h2 className="begg-trust-quote">
              “Tracking a scan isn&apos;t just about dots on a map.
              <br />
              It&apos;s about undeniable accountability in every link
              <br />
              of the circular recovery chain.”
            </h2>

            <div className="begg-trust-details-grid">
              <div className="begg-trust-col">
                <span className="begg-col-num">01</span>
                <h4>Cryptographic QR Identity</h4>
                <p>
                  Each consignment generates a unique tamper-evident identifier.
                  No duplicate tracking IDs or fraudulent scan submissions.
                </p>
              </div>

              <div className="begg-trust-col">
                <span className="begg-col-num">02</span>
                <h4>Real-Time Geodetic Validation</h4>
                <p>
                  GPS scan events are compared against official facility coordinates.
                  A delivery is only marked verified when physical proximity is proven.
                </p>
              </div>

              <div className="begg-trust-col">
                <span className="begg-col-num">03</span>
                <h4>Open Auditor Access</h4>
                <p>
                  Inspectors, clients, and municipal regulators can verify shipment
                  status without installing proprietary proprietary hardware.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SIGNATURE b-egg FOOTER ("don't miss a single shipment")
          ======================================================== */}
      <footer className="begg-footer">
        <div className="begg-container">
          <div className="begg-footer-top">
            <div className="begg-footer-title-block">
              <h2 className="begg-footer-headline">
                <span>don&apos;t miss</span>
                <span className="begg-footer-headline-accent">a single shipment.</span>
              </h2>
              <p className="begg-footer-sub">
                Verify waste consignments with modern QR telemetry.
                Start tracking now or inspect an active package.
              </p>
            </div>

            <div className="begg-footer-form-wrap">
              <form onSubmit={handleFooterTrack} className="begg-track-form">
                <input
                  type="text"
                  placeholder="Enter Tracking ID (e.g. TT-BIO-9021)..."
                  value={footerTrackingId}
                  onChange={(e) => setFooterTrackingId(e.target.value)}
                  className="begg-track-input"
                />
                <button type="submit" className="begg-track-submit-btn">
                  Track
                  <span>→</span>
                </button>
              </form>

              <div className="begg-footer-pills">
                <span className="begg-status-live-pill">
                  <span className="begg-live-dot" />
                  All telemetry nodes active
                </span>
                <span className="begg-ver-pill">V2.4 PROTOCOL</span>
              </div>
            </div>
          </div>

          <div className="begg-footer-links-row">
            <div className="begg-footer-brand">
              <div className="begg-footer-logo-row">
                <span className="begg-footer-logo-box">
                  <img src="/trashtrace.png" alt="TrashTrace Logo" />
                </span>
                <strong className="begg-footer-brand-name">
                  Trash<span>Trace</span>
                </strong>
              </div>
              <p className="begg-footer-brand-desc">
                High-precision QR verification and geolocation intelligence for
                sustainable waste management.
              </p>
            </div>

            <div className="begg-footer-nav-col">
              <strong>PLATFORM</strong>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/create">New Shipment</Link>
              <Link to="/scan">Scan Package</Link>
            </div>

            <div className="begg-footer-nav-col">
              <strong>PROTOCOLS</strong>
              <span>GPS Geofencing</span>
              <span>Tamper Resistance</span>
              <span>Municipal Compliance</span>
            </div>

            <div className="begg-footer-nav-col">
              <strong>SPECIFICATIONS</strong>
              <span>500m Verification</span>
              <span>Zero-Install Camera</span>
              <span>Universal Labels</span>
            </div>
          </div>

          <div className="begg-footer-bottom">
            <span>© {new Date().getFullYear()} TrashTrace. All rights reserved.</span>
            <span>Designed in the style of BEGG — Modern Organic Industrialism.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;