export interface VolunteerListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  totalScans: number;
}

export interface CreateVolunteerDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}
