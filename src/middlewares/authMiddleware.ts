import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { AppUser } from "../types";
import { logger } from "../shared/logger";

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
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
        errorSources: [],
      });
      return;
    }

    req.user = session.user as AppUser;
    req.session = session.session;

    next();
  } catch (error) {
    logger.error({ error }, "Authentication error in middleware");
    res.status(500).json({
      success: false,
      message: "Internal Server Error during authentication.",
      errorSources: [],
    });
  }
};
