function Card({
  children,
  padding = "md",
  className = "",
  ...props
}) {
  const classes = [
    "card",
    `card-padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="card-header">
      <div>
        {title && <h3 className="card-title">{title}</h3>}

        {description && (
          <p className="card-description">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="card-header-action">
          {action}
        </div>
      )}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return (
    <div className={`card-body ${className}`}>
      {children}
    </div>
  );
}

export default Card;