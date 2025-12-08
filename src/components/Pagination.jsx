export default function Pagination({ page, totalPages, onPageChange }) {
  const pages = [];
  const maxVisible = 5;

  let startPage = Math.max(0, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(0, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        ‹
      </button>

      {startPage > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            1
          </button>
          {startPage > 1 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-md border ${
            p === page
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {p + 1}
        </button>
      ))}

      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        ›
      </button>
    </div>
  );
}
