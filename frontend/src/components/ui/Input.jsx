function Input({
	label,
	hint,
	error,
	required = false,
	id,
	className = "",
	...props
}) {
	return (
		<div className="field">
			{label && (
				<label htmlFor={id} className="field-label">
					{label}
					{required && <span className="field-required">*</span>}
				</label>
			)}

			<input
				id={id}
				className={`input ${error ? "input-error" : ""} ${className}`}
				aria-invalid={Boolean(error)}
				{...props}
			/>

			{error ? (
				<p className="field-error">{error}</p>
			) : hint ? (
				<p className="field-hint">{hint}</p>
			) : null}
		</div>
	);
}

export default Input;