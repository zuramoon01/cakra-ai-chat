import { HttpStatusCode } from '../types/http-status-code';

export class DuplicateUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateUserError';
  }
}

export class InvalidDataError extends Error {
  // eslint-disable-next-line
  errors?: any;

  // eslint-disable-next-line
  constructor(message: string, errors?: any) {
    super(message);
    this.name = 'InvalidDataError';
    this.errors = errors;

    Object.setPrototypeOf(this, InvalidDataError.prototype);
  }
}

export function errorHandler(error: unknown) {
  const responseBody: {
    message: string;
    // eslint-disable-next-line
    errors?: any;
    errorType: string;
  } = {
    message: 'Error tidak diketahui. Mohon laporkan kepada Developer.',
    errorType: 'UncatchError',
  };

  const responseStatus: (typeof HttpStatusCode)[keyof typeof HttpStatusCode] =
    HttpStatusCode.BAD_REQUEST;

  if (error instanceof InvalidDataError) {
    if (error.errors) {
      responseBody.errors = error.errors;
    }
  }

  if (error instanceof Error) {
    responseBody.message = error.message;
    responseBody.errorType = error.name;
  }

  return {
    responseBody,
    responseStatus,
  };
}
