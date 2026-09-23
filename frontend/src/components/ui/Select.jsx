function Select({
  label,
  hint,
  error,
  required = false,
  id,
  options = [],
  placeholder = "Select an option",
  className = "",
  ...props
}) {
  return (
    <div className="field">
      {label && (
        <label
          htmlFor={id}
          className="field-label"
        >
          {label}

          {required && (
            <span className="field-required">
              *
            </span>
          )}
        </label>
      )}

      <select
        id={id}
        className={`select ${
          error ? "select-error" : ""
        } ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="field-error">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default Select;