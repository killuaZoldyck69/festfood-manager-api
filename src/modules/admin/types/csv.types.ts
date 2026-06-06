export interface CsvRow {
  name: string;
  email: string;
  studentId: string;
  university: string;
  role: string;
  category: string;
  semester: string;
  section: string;
}

export interface ParsedCsvRow extends CsvRow {
  // Can be extended later if CSV cleaning logic requires specific parsed types
}
