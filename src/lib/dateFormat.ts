/**
 * Format a date to DD/MM/YYYY (Indonesian numeric format).
 * Accepts a Date, ISO string, or yyyy-mm-dd string.
 */
export function formatDateID(input: string | Date | null | undefined): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (!d || isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** "DD/MM/YYYY" for use inside a filename (sanitized) */
export function formatDateIDForFilename(input: string | Date | null | undefined): string {
  return formatDateID(input).replace(/\//g, '-');
}