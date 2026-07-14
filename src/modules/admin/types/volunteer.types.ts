export interface VolunteerListItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: Date;
  totalScans: number;
  successScans: number;
  duplicateScans: number;
  invalidScans: number;
}

export interface CreateVolunteerDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}
