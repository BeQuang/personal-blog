export class AuthenticationError extends Error {
  readonly code = "UNAUTHORIZED";

  constructor(message = "Authentication is required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  readonly code = "FORBIDDEN";

  constructor(message = "You do not have permission to perform this action") {
    super(message);
    this.name = "AuthorizationError";
  }
}
