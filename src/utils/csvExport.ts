import { Athlete, TestSession } from '@/types/athlete';
import { Team } from '@/types/team';
import { biomotorCategories, calculateScore } from '@/data/biomotorTests';
import { calculateAgeFromDate, formatDateID, parseDateToISO } from '@/lib/dateFormat';

// Map normalized Excel/CSV column headers -> internal test id
// Keys are normalized via `norm()` (lowercase, no spaces/symbols).
const TEST_COLUMN_ALIASES: Record<string, string> = {
  // Sprint 30m
  sprint30m: 'sprint-30m',
  sprint30meter: 'sprint-30m',
  sprint30: 'sprint-30m',
  lari30m: 'sprint-30m',
  lari30meter: 'sprint-30m',
  // Sprint 60m / 100m
  sprint60m: 'sprint-60m',
  lari60m: 'sprint-60m',
  sprint100m: 'sprint-100m',
  lari100m: 'sprint-100m',
  // Illinois agility
  illinois: 'illinois-agility',
  illinoisagility: 'illinois-agility',
  illinoisagilitytest: 'illinois-agility',
  // Vertical jump
  verticaljump: 'vertical-jump',
  vertikaljump: 'vertical-jump',
  lompattegak: 'vertical-jump',
  lompatvertikal: 'vertical-jump',
  // Hand grip dynamometer
  handgrip: 'grip-strength',
  handgripdynamometer: 'grip-strength',
  gripstrength: 'grip-strength',
  genggam: 'grip-strength',
  // Leg dynamometer
  legdynamometer: 'leg-dynamometer',
  legdyno: 'leg-dynamometer',
  legstrength: 'leg-dynamometer',
  // Sit and reach
  sitandreach: 'sit-reach',
  sitreach: 'sit-reach',
  // Beep test
  beeptest: 'beep-test',
  beep: 'beep-test',
  // Push up / sit up / pull up
  pushup: 'push-up',
  situp: 'sit-up',
  pullup: 'pull-up',
  // Cooper test
  coopertest: 'cooper-test',
  cooper: 'cooper-test',
  // Standing broad jump
  standingbroadjump: 'standing-broad-jump',
  broadjump: 'standing-broad-jump',
};

function findTestIdForHeader(header: string): string | null {
  const k = header.toLowerCase().replace(/[\s_\-./()]/g, '');
  return TEST_COLUMN_ALIASES[k] || null;
}

function categoryIdForTest(testId: string): string | null {
  for (const cat of biomotorCategories) {
    if (cat.tests.some(t => t.id === testId)) return cat.id;
  }
  return null;
}

export interface ParsedAthleteTest {
  testId: string;
  categoryId: string;
  value: number;
}

// Parse test result columns from a single row.
// Beep test special: combine "beep level" + "beep shuttle" columns into one value (level.shuttle).
function parseTestsFromRow(row: Record<string, string>): ParsedAthleteTest[] {
  const results: ParsedAthleteTest[] = [];
  const normMap: Record<string, string> = {};
  for (const k of Object.keys(row)) {
    normMap[k.toLowerCase().replace(/[\s_\-./()]/g, '')] = row[k];
  }
  // Beep test (level + shuttle separately)
  const beepLevel = normMap['beeplevel'] ?? normMap['beeptestlevel'] ?? normMap['leveltest'];
  const beepShuttle = normMap['beepshuttle'] ?? normMap['beeptestshuttle'] ?? normMap['shuttle'] ?? normMap['shutle'];
  if (beepLevel && String(beepLevel).trim() !== '') {
    const lvl = parseFloat(String(beepLevel).replace(',', '.'));
    if (Number.isFinite(lvl)) {
      let val = lvl;
      if (beepShuttle && String(beepShuttle).trim() !== '') {
        const sh = parseInt(String(beepShuttle), 10);
        if (Number.isFinite(sh)) val = parseFloat(`${Math.trunc(lvl)}.${sh}`);
      }
      const catId = categoryIdForTest('beep-test');
      if (catId) results.push({ testId: 'beep-test', categoryId: catId, value: val });
    }
  }
  // Other tests
  for (const header of Object.keys(row)) {
    const testId = findTestIdForHeader(header);
    if (!testId) continue;
    if (testId === 'beep-test' && (beepLevel || beepShuttle)) continue; // already handled
    if (results.some(r => r.testId === testId)) continue;
    const raw = String(row[header] ?? '').trim();
    if (!raw) continue;
    const n = parseFloat(raw.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) continue;
    const catId = categoryIdForTest(testId);
    if (!catId) continue;
    results.push({ testId, categoryId: catId, value: n });
  }
  return results;
}

// Compute score for each parsed result using athlete profile.
export function computeTestScores(
  results: ParsedAthleteTest[],
  athlete: { gender: 'male' | 'female'; dateOfBirth: string },
): { testId: string; categoryId: string; value: number; score: number }[] {
  const age = calculateAgeFromDate(athlete.dateOfBirth);
  const out: { testId: string; categoryId: string; value: number; score: number }[] = [];
  for (const r of results) {
    const cat = biomotorCategories.find(c => c.id === r.categoryId);
    const test = cat?.tests.find(t => t.id === r.testId);
    if (!test) continue;
    const score = calculateScore(r.value, test, athlete.gender, age);
    out.push({ ...r, score });
  }
  return out;
}

// Convert data to CSV string
function arrayToCSV(data: Record<string, unknown>[], headers: string[]): string {
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or newline
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Export athletes to CSV
export function exportAthletesToCSV(athletes: Athlete[]) {
  const headers = ['name', 'dateOfBirth', 'gender', 'sport', 'team', 'createdAt'];
  const data = athletes.map(athlete => ({
    name: athlete.name,
    dateOfBirth: formatDateID(athlete.dateOfBirth),
    gender: athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan',
    sport: athlete.sport,
    team: athlete.team || '',
    createdAt: athlete.createdAt ? formatDateID(athlete.createdAt) : '',
  }));
  
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, `data-atlet-${new Date().toISOString().split('T')[0]}.csv`);
}

// Export teams to CSV
export function exportTeamsToCSV(teams: Team[]) {
  const headers = ['name', 'sport', 'description', 'color', 'createdAt'];
  const data = teams.map(team => ({
    name: team.name,
    sport: team.sport,
    description: team.description || '',
    color: team.color || '',
    createdAt: team.createdAt ? formatDateID(team.createdAt) : '',
  }));
  
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, `data-tim-${new Date().toISOString().split('T')[0]}.csv`);
}

// Export test results to CSV
export function exportTestResultsToCSV(
  testSessions: TestSession[], 
  athletes: Athlete[],
  categoryNames: Record<string, string>,
  testNames: Record<string, string>
) {
  const headers = ['athleteName', 'date', 'category', 'test', 'value', 'score'];
  const data: Record<string, unknown>[] = [];
  
  for (const session of testSessions) {
    const athlete = athletes.find(a => a.id === session.athleteId);
    for (const result of session.results) {
      data.push({
        athleteName: athlete?.name || 'Unknown',
        date: session.date ? formatDateID(session.date) : '',
        category: categoryNames[result.categoryId] || result.categoryId,
        test: testNames[result.testId] || result.testId,
        value: result.value,
        score: result.score,
      });
    }
  }
  
  const csv = arrayToCSV(data, headers);
  downloadCSV(csv, `hasil-tes-${new Date().toISOString().split('T')[0]}.csv`);
}

// Parse CSV string to array of objects
export function parseCSV(csvContent: string): Record<string, string>[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const firstLine = lines[0];
  const delimiter = [';', '\t', ','].reduce((best, current) =>
    firstLine.split(current).length > firstLine.split(best).length ? current : best
  , ',');
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

// Parse imported athletes from CSV/Excel
export function parseAthletesFromCSV(data: Record<string, string>[]): Omit<Athlete, 'id'>[] {
  const defaultDOB = '2000-01-01';
  const norm = (s: string) => s.toLowerCase().replace(/[\s_\-./()]/g, '');
  const pick = (row: Record<string, string>, keys: string[]): string => {
    const map: Record<string, string> = {};
    for (const k of Object.keys(row)) map[norm(k)] = row[k];
    for (const k of keys) {
      const v = map[norm(k)];
      if (v !== undefined && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  };
  const parseDOB = (raw: string): string => {
    return parseDateToISO(raw) || defaultDOB;
  };
  const parseNumber = (raw: string): number | undefined => {
    const n = Number(raw.replace(',', '.').replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  return data.map<Omit<Athlete, 'id'> | null>((row, index) => {
    const hasAnyValue = Object.values(row).some(v => String(v ?? '').trim() !== '');
    if (!hasAnyValue) return null;
    const name = pick(row, ['name', 'nama', 'atlet', 'namaatlet', 'fullname', 'namalengkap', 'pemain', 'peserta', 'siswa']) || `Atlet Baris ${index + 2}`;
    const sport = pick(row, ['sport', 'cabor', 'olahraga', 'cabangolahraga', 'cabang']) || 'Umum';
    const genderRaw = pick(row, ['gender', 'jeniskelamin', 'jk', 'sex', 'kelamin']).toLowerCase();
    const isFemale = ['perempuan', 'female', 'wanita', 'putri', 'p', 'f'].includes(genderRaw);
    const dobRaw = pick(row, ['dateofbirth', 'tanggallahir', 'tgllahir', 'dob', 'birthdate', 'tanggal_lahir', 'lahir']);
    const team = pick(row, ['team', 'tim', 'klub', 'club', 'kelas', 'grup']);
    const height = parseNumber(pick(row, ['height', 'tinggi', 'tinggibadan', 'tb']));
    const weight = parseNumber(pick(row, ['weight', 'berat', 'beratbadan', 'bb']));
    const tests = parseTestsFromRow(row);
    const athlete: Omit<Athlete, 'id'> = {
      name,
      dateOfBirth: parseDOB(dobRaw),
      gender: (isFemale ? 'female' : 'male') as 'male' | 'female',
      sport,
      team: team || undefined,
      height,
      weight,
      createdAt: new Date().toISOString(),
    };
    if (tests.length > 0) {
      // Stash parsed tests on the object; consumed by addAthletes during import.
      (athlete as Athlete & { __tests?: ParsedAthleteTest[] }).__tests = tests;
    }
    return athlete;
  }).filter((a): a is Omit<Athlete, 'id'> => Boolean(a));
}

// Parse imported teams from CSV
export function parseTeamsFromCSV(data: Record<string, string>[]): Omit<Team, 'id' | 'createdAt'>[] {
  const norm = (s: string) => s.toLowerCase().replace(/[\s_\-./()]/g, '');
  const pick = (row: Record<string, string>, keys: string[]): string => {
    const map: Record<string, string> = {};
    for (const k of Object.keys(row)) map[norm(k)] = row[k];
    for (const k of keys) {
      const v = map[norm(k)];
      if (v !== undefined && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  };

  return data.map(row => ({
    name: pick(row, ['name', 'nama', 'namatim', 'team', 'tim']),
    sport: pick(row, ['sport', 'cabor', 'olahraga', 'cabangolahraga', 'cabang']),
    description: pick(row, ['description', 'deskripsi', 'keterangan']) || undefined,
    color: pick(row, ['color', 'warna']) || '#3B82F6',
  })).filter(t => t.name && t.sport);
}