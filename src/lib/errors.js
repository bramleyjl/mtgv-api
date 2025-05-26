export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RouteNotFoundError extends AppError {
  constructor(originalUrl) {
    super(`Requested route '${originalUrl}' does not exist`, 404);
    this.originalUrl = originalUrl;
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource, identifier) {
    super(`${resource} not found: ${identifier}`, 404);
    this.resource = resource;
    this.identifier = identifier;
  }
}

export class CardNotFoundError extends NotFoundError {
  constructor(cardName) {
    super('Card', cardName);
  }
}

export class DatabaseError extends AppError {
  constructor(operation, details) {
    super(`Database error during ${operation}`, 500, details);
    this.operation = operation;
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, message, details = null) {
    super(`Error from ${service}: ${message}`, 502, details);
    this.service = service;
  }
}