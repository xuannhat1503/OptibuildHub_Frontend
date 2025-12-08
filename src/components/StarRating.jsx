import { useState } from "react";

export default function StarRating({ value = 0, onChange = null, readonly = false }) {
  const [hover, setHover] = useState(0);
  const isInteractive = !readonly && onChange;

  const handleClick = (rating) => {
    if (isInteractive) {
      onChange(rating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!isInteractive}
          onClick={() => handleClick(star)}
          onMouseEnter={() => isInteractive && setHover(star)}
          onMouseLeave={() => isInteractive && setHover(0)}
          className={`text-2xl transition-colors ${
            isInteractive ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <span
            className={
              star <= (hover || value)
                ? "text-yellow-400"
                : "text-gray-300"
            }
          >
            ★
          </span>
        </button>
      ))}
      {readonly && value > 0 && (
        <span className="ml-2 text-sm text-gray-600">({value.toFixed(1)})</span>
      )}
    </div>
  );
}
