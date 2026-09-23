const statusConfig = {
  CREATED: {
    label: "Created",
    variant: "neutral",
  },

  IN_TRANSIT: {
    label: "In transit",
    variant: "info",
  },

  DELIVERED: {
    label: "Delivered",
    variant: "success",
  },

  ERROR: {
    label: "Error",
    variant: "danger",
  },

  TRANSIT_SCAN: {
    label: "Transit scan",
    variant: "info",
  },
};

function Badge({
  children,
  variant = "neutral",
  status,
}) {
  const config = status
    ? statusConfig[status]
    : null;

  const label =
    config?.label ?? children;

  const badgeVariant =
    config?.variant ?? variant;

  return (
    <span
      className={`badge badge-${badgeVariant}`}
    >
      <span className="badge-dot" />
      {label}
    </span>
  );
}

export default Badge;