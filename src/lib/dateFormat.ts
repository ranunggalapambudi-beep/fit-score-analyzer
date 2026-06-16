const pad2 = (value: number) => String(value).padStart(2, '0');

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

function normalizeYear(value: string): number {
  const year = Number(value);
  if (value.length === 2) return year > 30 ? 1900 + year : 2000 + year;
  return year;
}

export function excelSerialDateToISO(serial: number): string | null {
  if (!Number.isFinite(serial) || serial <= 1000 || serial >= 80000) return null;
  const wholeDays = Math.floor(serial);
  const utc = Date.UTC(1899, 11, 30) + wholeDays * 86400 * 1000;
  const d = new Date(utc);
  const yyyy = d.getUTCFullYear();
  const mm = d.getUTCMonth() + 1;
  const dd = d.getUTCDate();
  return isValidDateParts(yyyy, mm, dd) ? `${yyyy}-${pad2(mm)}-${pad2(dd)}` : null;
}

/**
 * Parse dates explicitly. Numeric Indonesian dates are ALWAYS DD/MM/YYYY,
 * never MM/DD/YYYY, so Excel imports cannot swap day and month.
 */
export function parseDateToISO(input: string | number | Date | null | undefined): string | null {
  if (input === null || input === undefined || input === '') return null;

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    const yyyy = input.getFullYear();
    const mm = input.getMonth() + 1;
    const dd = input.getDate();
    return isValidDateParts(yyyy, mm, dd) ? `${yyyy}-${pad2(mm)}-${pad2(dd)}` : null;
  }

  if (typeof input === 'number') return excelSerialDateToISO(input);

  const value = input.trim();
  if (!value) return null;

  if (/^\d{4,6}(\.\d+)?$/.test(value)) {
    const fromSerial = excelSerialDateToISO(Number(value));
    if (fromSerial) return fromSerial;
  }

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  if (iso) {
    const yyyy = Number(iso[1]);
    const mm = Number(iso[2]);
    const dd = Number(iso[3]);
    return isValidDateParts(yyyy, mm, dd) ? `${yyyy}-${pad2(mm)}-${pad2(dd)}` : null;
  }

  const dmy = value.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (dmy) {
    const dd = Number(dmy[1]);
    const mm = Number(dmy[2]);
    const yyyy = normalizeYear(dmy[3]);
    return isValidDateParts(yyyy, mm, dd) ? `${yyyy}-${pad2(mm)}-${pad2(dd)}` : null;
  }

  return null;
}

/**
 * Format a date to DD/MM/YYYY (Indonesian numeric format).
 * Accepts Date, ISO string, DD/MM/YYYY string, or Excel serial date.
 */
export function formatDateID(input: string | number | Date | null | undefined): string {
  const iso = parseDateToISO(input);
  if (!iso) return '';
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

export function calculateAgeFromDate(input: string | number | Date | null | undefined, asOf: Date = new Date()): number {
  const iso = parseDateToISO(input);
  if (!iso) return 0;
  const [year, month, day] = iso.split('-').map(Number);
  let age = asOf.getFullYear() - year;
  const hasHadBirthday = asOf.getMonth() + 1 > month || (asOf.getMonth() + 1 === month && asOf.getDate() >= day);
  if (!hasHadBirthday) age -= 1;
  return Math.max(0, age);
}

/** "DD/MM/YYYY" for use inside a filename (sanitized) */
export function formatDateIDForFilename(input: string | number | Date | null | undefined): string {
  return formatDateID(input).replace(/\//g, '-');
}