export type ApplicationErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export class ApplicationError extends Error {
  constructor(
    message: string,
    readonly code: ApplicationErrorCode,
    readonly statusCode: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ApplicationError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(
    message = "The supplied data is invalid",
    readonly fieldErrors: Readonly<Partial<Record<string, readonly string[]>>> = {},
    options?: ErrorOptions,
  ) {
    super(message, "VALIDATION_ERROR", 400, options);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApplicationError {
  constructor(entity: string, identifier?: string, options?: ErrorOptions) {
    super(
      identifier ? `${entity} '${identifier}' was not found` : `${entity} was not found`,
      "NOT_FOUND",
      404,
      options,
    );
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = "Authentication is required", options?: ErrorOptions) {
    super(message, "UNAUTHORIZED", 401, options);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message = "You do not have permission to perform this action", options?: ErrorOptions) {
    super(message, "FORBIDDEN", 403, options);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends ApplicationError {
  constructor(message = "The resource conflicts with existing data", options?: ErrorOptions) {
    super(message, "CONFLICT", 409, options);
    this.name = "ConflictError";
  }
}

function getPostgresCode(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return undefined;
  }

  return typeof error.code === "string" ? error.code : undefined;
}

export function mapDatabaseError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  const postgresCode = getPostgresCode(error);

  if (postgresCode === "23505") {
    return new ConflictError("A record with the same unique value already exists", {
      cause: error,
    });
  }

  if (postgresCode === "23503" || postgresCode === "23514" || postgresCode === "22P02") {
    return new ValidationError("The data violates a database constraint", {}, { cause: error });
  }

  return new ApplicationError("The database operation failed", "INTERNAL_ERROR", 500, {
    cause: error,
  });
}
