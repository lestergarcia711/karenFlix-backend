export class AppError extends Error {
  #statusCode;
  #status;
  #details;
  #isOperational;

  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.#statusCode = statusCode;
    this.#status = this.#resolveStatus(statusCode);
    this.#details = details;
    this.#isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  #resolveStatus(statusCode) {
    return `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  }

  get statusCode() {
    return this.#statusCode;
  }

  get status() {
    return this.#status;
  }

  get details() {
    return this.#details;
  }

  get isOperational() {
    return this.#isOperational;
  }
}

export default AppError;
