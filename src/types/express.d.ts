export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "VOLUNTEER";
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    export interface Request {
      user?: AppUser;
      session?: unknown;
    }
  }
}
