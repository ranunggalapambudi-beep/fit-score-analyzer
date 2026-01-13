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
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const data: Record<string, string>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
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

// Parse imported athletes from CSV
export function parseAthletesFromCSV(data: Record<string, string>[]): Omit<Athlete, 'id'>[] {
  return data.map(row => {
    const genderRaw = row.gender || row.jenisKelamin || '';
    const isFemale = genderRaw.toLowerCase() === 'perempuan' || genderRaw.toLowerCase() === 'female';
    return {
      name: row.name || row.nama || '',
      dateOfBirth: row.dateOfBirth || row.tanggalLahir || row.tgl_lahir || '',
      gender: (isFemale ? 'female' : 'male') as 'male' | 'female',
      sport: row.sport || row.cabor || row.olahraga || '',
      team: row.team || row.tim || undefined,
      createdAt: new Date().toISOString(),
    };
  }).filter(a => a.name && a.sport);
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