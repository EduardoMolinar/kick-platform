/**
 * Common reference types used across all domain types.
 * These are lightweight "pointer" shapes — full detail types live in their
 * respective domain files.
 */

export interface TeamRef {
  id: string;
  name: string;
  shortName: string;   // e.g. "Real Madrid" → "Madrid"
  code?: string;       // e.g. "RMA"
  crestUrl: string;    // absolute URL served via backend CDN proxy
}

export interface CompetitionRef {
  id: string;
  name: string;
  code: string;        // e.g. "UCL", "PL", "PD"
  emblemUrl: string;
}

/** Generic paginated response wrapper. */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
