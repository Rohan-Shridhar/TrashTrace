import { Link } from "react-router-dom";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

import "./home.css";

const workflow = [
  {
    number: "01",
    title: "Create a shipment",
    description:
      "Register a waste package with its type, starting location, and intended destination.",
  },
  {
    number: "02",
    title: "Attach the QR code",
    description:
      "Generate a unique QR code and attach it to the physical package.",
  },
  {
    number: "03",
    title: "Scan along the way",
    description:
      "Each scan records the location where the QR code was scanned.",
  },
  {
    number: "04",
    title: "Verify the destination",
    description:
      "A scan within the configured destination radius marks the shipment as delivered.",
  },
];

const capabilities = [
  {
    title: "QR-based tracking",
    description:
      "Every shipment gets a unique tracking ID and scannable QR code.",
  },
  {
    title: "Location scans",
    description:
      "Record where a package's QR code was scanned during its journey.",
  },
  {
    title: "Delivery verification",
    description:
      "Compare scan location with the intended destination to determine delivery status.",
  },
  {
    title: "Shipment history",
    description:
      "Review previous scans and see how a shipment progressed over time.",
  },
];

function Home() {
  return (
    <div className="home-page">
      {/* ========================================
          HERO
          ======================================== */}

      <section className="home-hero">
        <div className="home-container">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Waste logistics visibility
            </div>

            <h1 className="hero-title">
              Know where your waste
              <span> is going.</span>
            </h1>

            <p className="hero-description">
              TrashTrace uses QR codes and location scans to make
              waste shipments easier to trace from their source to
              their intended destination.
            </p>

            <div className="hero-actions">
              <Link to="/create">
                <Button size="lg">
                  Create a shipment
                </Button>
              </Link>

              <Link to="/scan">
                <Button
                  variant="secondary"
                  size="lg"
                >
                  Scan a package
                </Button>
              </Link>
            </div>

            <p className="hero-note">
              No account required to scan a package.
            </p>
          </div>

          {/* Product visual */}

          <div className="hero-visual">
            <div className="tracking-card">
              <div className="tracking-card-top">
                <div>
                  <span className="tracking-label">
                    SHIPMENT
                  </span>

                  <strong className="tracking-id">
                    TT-A1B2C3D4
                  </strong>
                </div>

                <span className="tracking-status">
                  <span />
                  In transit
                </span>
              </div>

              <div className="route-line">
                <div className="route-point route-point-source">
                  <span />
                </div>

                <div className="route-progress">
                  <div />
                </div>

                <div className="route-point route-point-destination">
                  <span />
                </div>
              </div>

              <div className="route-details">
                <div>
                  <span>Source</span>
                  <strong>Collection point</strong>
                </div>

                <div className="route-arrow">
                  →
                </div>

                <div className="route-destination">
                  <span>Destination</span>
                  <strong>Recycling centre</strong>
                </div>
              </div>

              <div className="tracking-card-footer">
                <span>Last scan</span>
                <strong>Location recorded</strong>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card-top">
              <span className="floating-icon">
                ✓
              </span>

              <div>
                <strong>QR scan recorded</strong>
                <span>Just now</span>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card-bottom">
              <span className="floating-icon floating-icon-location">
                +
              </span>

              <div>
                <strong>Location captured</strong>
                <span>GPS coordinates</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          INTRO
          ======================================== */}

      <section className="home-intro">
        <div className="home-container home-intro-grid">
          <div>
            <span className="section-eyebrow">
              Simple by design
            </span>

            <h2>
              A clear trail for every package.
            </h2>
          </div>

          <div>
            <p>
              Waste can pass through several hands before reaching
              its intended destination. TrashTrace creates a simple
              digital trail using something already easy to attach
              to a physical package: a QR code.
            </p>

            <p>
              Scan events provide visibility into where the package
              was scanned and whether the latest scan is close enough
              to its destination to be considered delivered.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================
          WORKFLOW
          ======================================== */}

      <section className="home-workflow">
        <div className="home-container">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">
                How it works
              </span>

              <h2>
                From package to destination.
              </h2>
            </div>

            <p>
              Four straightforward steps keep the tracking process
              easy to understand.
            </p>
          </div>

          <div className="workflow-grid stagger-children">
            {workflow.map((step) => (
              <div
                className="workflow-item"
                key={step.number}
              >
                <span className="workflow-number">
                  {step.number}
                </span>

                <div>
                  <h3>{step.title}</h3>

                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          CAPABILITIES
          ======================================== */}

      <section className="home-capabilities stagger-children">
        <div className="home-container">
          <div className="section-heading section-heading-centered">
            <span className="section-eyebrow">
              What you can do
            </span>

            <h2>
              Everything needed to trace a shipment.
            </h2>

            <p>
              Keep the tracking experience focused on the information
              that actually matters.
            </p>
          </div>

          <div className="capabilities-grid">
            {capabilities.map((capability, index) => (
              <Card
                key={capability.title}
                padding="lg"
                className="capability-card"
              >
                <span className="capability-number">
                  0{index + 1}
                </span>

                <h3>{capability.title}</h3>

                <p>{capability.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================
          LIMITATION / TRUST
          ======================================== */}

      <section className="home-trust">
        <div className="home-container">
          <div className="trust-panel">
            <div className="trust-icon">
              i
            </div>

            <div>
              <span className="section-eyebrow">
                Important to understand
              </span>

              <h2>
                Tracking a scan isn't the same as tracking
                the physical package.
              </h2>

              <p>
                TrashTrace records where the QR code was scanned.
                A scan near the intended destination can indicate
                that the package reached that area, but it doesn't
                guarantee physical delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          CTA
          ======================================== */}

      <section className="home-cta">
        <div className="home-container">
          <div className="cta-panel">
            <div>
              <span className="section-eyebrow">
                Start tracking
              </span>

              <h2>
                Give your next waste shipment a traceable trail.
              </h2>

              <p>
                Create a shipment, generate its QR code, and start
                recording scan events.
              </p>
            </div>

            <div className="cta-actions">
              <Link to="/create">
                <Button
                  size="lg"
                  variant="secondary"
                >
                  Create shipment
                </Button>
              </Link>

              <Link
                to="/dashboard"
                className="cta-secondary-link"
              >
                Open dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          FOOTER
          ======================================== */}

      <footer className="home-footer">
        <div className="home-container footer-inner">
          <div>
            <strong>TrashTrace</strong>
            <span>
              QR-based waste shipment tracking.
            </span>
          </div>

          <span>
            Track scans. Verify destinations.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;