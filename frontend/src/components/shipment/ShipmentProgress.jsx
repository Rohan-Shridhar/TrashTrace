import React from 'react';
import './shipment-progress.css';

const STEPS = [
  {
    key: 'CREATED',
    label: 'Created',
    description: 'Shipment registered',
  },
  {
    key: 'IN_TRANSIT',
    label: 'In transit',
    description: 'Package has been scanned',
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    description: 'Destination verified',
  },
];

const getActiveStep = (status) => {
  if (status === 'DELIVERED') return 2;
  if (status === 'IN_TRANSIT') return 1;
  return 0;
};

const ShipmentProgress = ({ status = 'CREATED' }) => {
  const activeStep = getActiveStep(status);

  return (
    <div
      className="shipment-progress"
      aria-label={`Shipment status: ${status}`}
    >
      <div className="shipment-progress__track">
        <div
          className="shipment-progress__fill"
          style={{
            width: `${(activeStep / (STEPS.length - 1)) * 100}%`,
          }}
        />
      </div>

      <div className="shipment-progress__steps">
        {STEPS.map((step, index) => {
          const isCompleted = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <div
              key={step.key}
              className={[
                'shipment-progress__step',
                isCompleted
                  ? 'shipment-progress__step--completed'
                  : '',
                isCurrent
                  ? 'shipment-progress__step--current'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="shipment-progress__marker">
                {isCompleted ? (
                  <span aria-hidden="true">✓</span>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              <div className="shipment-progress__content">
                <strong>{step.label}</strong>

                <span>{step.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
   );
};

export default ShipmentProgress;