import { TGenericErrorResponse } from "../../types/error.interface";

export interface PrismaErrorLike {
  code: string;
  meta?: { target?: string[] };
}

export const handlePrismaError = (
  err: PrismaErrorLike,
): TGenericErrorResponse => {
  let statusCode = 400;
  let message = "Database Error";
  let errorSources = [
    { path: "", message: "Something went wrong with the database" },
  ];

  switch (err.code) {
    case "P2025":
      statusCode = 404;
      message = "Record not found";
      errorSources = [
        { path: "", message: "The requested record does not exist." },
      ];
      break;
    case "P2002": {
      const target = err.meta?.target || ["unknown_field"];
      statusCode = 409;
      message = "Duplicate Entry";
      errorSources = target.map((field) => ({
        path: field,
        message: `A record with this ${field} already exists.`,
      }));
      break;
    }
    case "P2003":
      statusCode = 409;
      message = "Foreign Key Constraint Failed";
      errorSources = [
        {
          path: "",
          message:
            "A related record could not be found or a constraint failed.",
        },
      ];
      break;
    case "P2014":
      statusCode = 409;
      message = "Required Relation Violated";
      errorSources = [
        {
          path: "",
          message: "A required relation between records was violated.",
        },
      ];
      break;
    case "P2021":
      statusCode = 500;
      message = "Table Does Not Exist";
      errorSources = [
        { path: "", message: "The queried database table does not exist." },
      ];
      break;
    case "P2024":
      statusCode = 503;
      message = "Connection Pool Timeout";
      errorSources = [
        {
          path: "",
          message:
            "Could not connect to the database within the timeout period.",
        },
      ];
      break;
  }

  return { statusCode, message, errorSources };
};
