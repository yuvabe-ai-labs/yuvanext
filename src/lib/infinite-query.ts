import type { PaginatedResponse } from "@/types/mentor.types";

/**
 * Shared `getNextPageParam` for the API's `{ data, pagination }` envelope.
 *
 * Services resolve to `null` when a request fails, so a nullish page ends the
 * sequence rather than looping on the same page forever.
 */
export const getNextPageParam = <T>(
  lastPage: PaginatedResponse<T> | null | undefined,
): number | undefined => {
  const pagination = lastPage?.pagination;
  if (!pagination) return undefined;

  const { currentPage, totalPages } = pagination;
  return currentPage < totalPages ? currentPage + 1 : undefined;
};

/**
 * Flattens infinite-query pages into a single list, skipping failed pages.
 *
 * Pass `getKey` to drop repeats: a row can legitimately appear on two pages
 * when the underlying query joins one-to-many, and unlike paged rendering,
 * accumulated pages would then produce duplicate React keys.
 */
export const flattenPages = <T>(
  pages: (PaginatedResponse<T> | null | undefined)[] | undefined,
  getKey?: (item: T) => string,
): T[] => {
  const items = (pages ?? []).flatMap((page) => page?.data ?? []);
  if (!getKey) return items;

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
