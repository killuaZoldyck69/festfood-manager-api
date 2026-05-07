import { Session, User } from "../generated/prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user?: User;
      session?: Session;
    }
  }
}
