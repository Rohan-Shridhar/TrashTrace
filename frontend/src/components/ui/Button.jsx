import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  onClick,
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth ? 'btn-full' : '',
        loading ? 'btn-loading' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>Working…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;