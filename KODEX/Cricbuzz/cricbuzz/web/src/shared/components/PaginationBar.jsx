const PAGE_LIMITS = [10, 20, 50];

function PaginationBar({ meta, limit, onLimitChange, onPageChange }) {
  const page = meta?.page || 1;
  const totalPages = meta?.totalPages || 1;
  const total = meta?.total || 0;
  const hasPrevPage = Boolean(meta?.hasPrevPage);
  const hasNextPage = Boolean(meta?.hasNextPage);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm">
      <div className="font-medium text-slate-600">
        Page {page} of {totalPages} - {total} total
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-slate-600">
          <span>Rows</span>
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            {PAGE_LIMITS.map((pageLimit) => (
              <option key={pageLimit} value={pageLimit}>
                {pageLimit}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="h-9 rounded-md border border-slate-300 bg-white px-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaginationBar;
