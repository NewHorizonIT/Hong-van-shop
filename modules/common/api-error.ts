export class ApiException extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "ApiException";
  }
}

export class UnauthorizedException extends ApiException {
  constructor(message: string = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedException";
  }
}

export class ForbiddenException extends ApiException {
  constructor(message: string = "Forbidden") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenException";
  }
}

export class NotFoundException extends ApiException {
  constructor(resource: string = "Resource") {
    super("NOT_FOUND", `${resource} not found`, 404);
    this.name = "NotFoundException";
  }
}

export class ValidationException extends ApiException {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
    this.name = "ValidationException";
  }
}

export class InvalidCredentialsException extends ApiException {
  constructor() {
    super("INVALID_CREDENTIALS", "Invalid email or password", 401);
    this.name = "InvalidCredentialsException";
  }
}
