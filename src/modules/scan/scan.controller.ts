import { Request, Response } from "express";
import { processScan } from "./scan.service";
import { scanRequestSchema } from "./scan.schema";

export const handleScan = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Validate the request body
    const validatedData = scanRequestSchema.parse({ body: req.body });
    const { qrToken } = validatedData.body;

    // 2. Get the user from the auth middleware
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Unauthorized. Missing user context." });
    }
    const volunteerId = req.user.id; // TypeScript now knows it is 100% safe

    // 3. Pass data to the Service layer
    const result = await processScan(qrToken, volunteerId);

    // 4. Send the HTTP response based on the service's result code
    const { code, ...responseData } = result;
    return res.status(code).json(responseData);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Scan Controller Error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error during scanning." });
  }
};
