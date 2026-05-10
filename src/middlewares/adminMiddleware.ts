import { Request, Response, NextFunction } from "express";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // We assume requireAuth has already run before this
  if (req.user!.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden: Admin access required." });
    return;
  }
  next();
};
