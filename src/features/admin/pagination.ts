export const ADMIN_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

/** Parse & clamp ?page & ?pageSize from a request's search params. */
export function parsePageParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Math.floor(Number(searchParams.get('page')) || 1));
  const rawSize = Math.floor(Number(searchParams.get('pageSize')) || ADMIN_PAGE_SIZE);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawSize));
  return { page, pageSize };
}

/** Total number of pages for a given item count (at least 1). */
export function pageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
