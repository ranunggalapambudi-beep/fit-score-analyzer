import { Athlete, TestSession } from '@/types/athlete';
import { Team } from '@/types/team';

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
    dateOfBirth: athlete.dateOfBirth,
    gender: athlete.gender === 'male' ? 'Laki-laki' : 'Perempuan',
    sport: athlete.sport,
    team: athlete.team || '',
    createdAt: athlete.createdAt ? new Date(athlete.createdAt).toLocaleDateString('id-ID') : '',
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
    createdAt: team.createdAt ? new Date(team.createdAt).toLocaleDateString('id-ID') : '',
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
        date: session.date ? new Date(session.date).toLocaleDateString('id-ID') : '',
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
  const isValidISODate = (value: string): boolean => {
    const d = new Date(value);
    return !isNaN(d.getTime()) && d.toISOString().startsWith(value);
  };
  const parseDOB = (raw: string): string => {
    if (!raw) return defaultDOB;
    const s = raw.trim();
    // Excel serial number
    if (/^\d{4,6}(\.\d+)?$/.test(s)) {
      const n = parseFloat(s);
      if (n > 1000 && n < 80000) {
        const ms = Math.round((n - 25569) * 86400 * 1000);
        const d = new Date(ms);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
      }
    }
    // dd/mm/yyyy or dd-mm-yyyy
    const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
    if (m) {
      const dd = m[1].padStart(2, '0');
      const mm = m[2].padStart(2, '0');
      let yy = m[3];
      if (yy.length === 2) yy = (parseInt(yy) > 30 ? '19' : '20') + yy;
      const iso = `${yy}-${mm}-${dd}`;
      return isValidISODate(iso) ? iso : defaultDOB;
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return defaultDOB;
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
    return {
      name,
      dateOfBirth: parseDOB(dobRaw),
      gender: (isFemale ? 'female' : 'male') as 'male' | 'female',
      sport,
      team: team || undefined,
      height,
      weight,
      createdAt: new Date().toISOString(),
    };
  }).filter((a): a is Omit<Athlete, 'id'> => Boolean(a));
}

// Parse imported teams from CSV
export function parseTeamsFromCSV(data: Record<string, string>[]): Omit<Team, 'id' | 'createdAt'>[] {
  return data.map(row => ({
    name: row.name || row.nama || '',
    sport: row.sport || row.cabor || row.olahraga || '',
    description: row.description || row.deskripsi || undefined,
    color: row.color || row.warna || '#3B82F6',
  })).filter(t => t.name && t.sport);
}