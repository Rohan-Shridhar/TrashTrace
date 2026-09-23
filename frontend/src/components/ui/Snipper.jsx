import React from 'react';

const Spinner = ({ size = 'md', label = '' }) => {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <span className="spinner" aria-hidden="true" />

      {label && (
        <span className="spinner-label">
          {label}
        </span>
      )}
    </div>
  );
};

export default Spinner;