import { useState, useMemo } from "react";

export default function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  // Reset to page 1 when items change length significantly (e.g., after search)
  const resetPage = () => setPage(1);

  return { page: safePage, setPage, totalPages, pageItems, resetPage };
}
