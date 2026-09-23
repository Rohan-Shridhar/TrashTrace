import React from 'react';

const Spinner = ({
  size = 'md',
  label = 'Loading',
}) => {
  return (
    <span
      className={`spinner spinner--${size}`}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <span className="spinner__circle" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default Spinner;