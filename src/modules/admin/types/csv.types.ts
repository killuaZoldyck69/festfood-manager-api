export interface CsvRow {
  name: string;
  email: string;
  studentId: string;
  university: string;
  department: string;
  phone: string;
  semester: string;
  team: string;
  role: string;
  segment: string;
}

export interface ParsedCsvRow extends CsvRow {
  // Can be extended later if CSV cleaning logic requires specific parsed types
}
