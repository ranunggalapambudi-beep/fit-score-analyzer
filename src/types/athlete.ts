export interface Athlete {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  sport: string;
  team?: string;
  height?: number;
  weight?: number;
  photo?: string;
  createdAt: string;
}

export interface TestResult {
  id: string;
  athleteId: string;
  testId: string;
  categoryId: string;
  value: number;
  score: number;
  date: string;
  notes?: string;
}

export interface TestSession {
  id: string;
  athleteId: string;
  date: string;
  results: TestResult[];
  notes?: string;
}
