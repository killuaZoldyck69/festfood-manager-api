import { Prisma } from "../../generated/prisma/client";
import { TGenericErrorResponse } from "../../types/error.interface";

export const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = "Database Error";
  let errorSources = [
    { path: "", message: "Something went wrong with the database" },
  ];

  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
    errorSources = [
      { path: "", message: "The requested record does not exist." },
    ];
  } else if (err.code === "P2002") {
    const target = (err.meta?.target as string[]) || ["unknown_field"];
    statusCode = 409;
    message = "Duplicate Entry";
    errorSources = target.map((field) => ({
      path: field,
      message: `A record with this ${field} already exists.`,
    }));
  }

  return { statusCode, message, errorSources };
};
