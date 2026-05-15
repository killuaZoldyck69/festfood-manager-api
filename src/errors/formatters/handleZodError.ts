import { ZodError } from "zod";
import { TGenericErrorResponse } from "../../types/error.interface";

export const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources = err.issues.map((issue) => ({
    path: (issue.path[issue.path.length - 1] as string | number) || "",
    message: issue.message,
  }));

  return {
    statusCode: 400,
    message: "Validation Error",
    errorSources,
  };
};
