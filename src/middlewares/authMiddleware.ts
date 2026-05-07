import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { Session, User } from "../generated/prisma/client";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Unauthorized. Please log in." });
      return;
    }

    req.user = session.user as unknown as User;
    req.session = session.session as unknown as Session;

    next();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error during authentication." });
  }
};
