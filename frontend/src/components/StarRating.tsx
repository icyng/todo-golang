type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  label?: string;
};

export const StarRating = ({
  value,
  onChange,
  disabled = false,
  size = "sm",
  className = "",
  label = "優先度",
}: StarRatingProps) => {
  const iconSize = size === "sm" ? "text-base" : "text-lg";
  const containerClass =
    `inline-flex items-center gap-0.5 leading-none align-middle normal-case ${className}`.trim();
  const isInteractive = typeof onChange === "function";

  return (
    <span
      className={containerClass}
      aria-label={`${label} ${value}`}
      data-interactive={isInteractive ? "true" : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const icon = filled ? "star" : "star_border";
        const color = filled ? "text-amber-300" : "text-slate-600";

        if (!isInteractive) {
          return (
            <span
              key={star}
              className={`material-icons-round block leading-none ${iconSize} ${color}`}
              aria-hidden="true"
            >
              {icon}
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange?.(star);
            }}
            disabled={disabled}
            className="flex items-center leading-none p-0 transition disabled:cursor-not-allowed"
            aria-label={`${label} ${star}`}
          >
            <span
              className={`material-icons-round block leading-none ${iconSize} ${color} ${
                disabled ? "" : "hover:text-amber-200"
              }`}
            >
              {icon}
            </span>
          </button>
        );
      })}
    </span>
  );
};

export default StarRating;
