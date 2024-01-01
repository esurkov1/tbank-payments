/* eslint-disable max-classes-per-file */
/**
 * Кастомные классы ошибок для T-Bank API
 */
class TbankError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'TbankError';
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class TbankApiError extends TbankError {
  constructor(message, code, details) {
    super(message, code, details);
    this.name = 'TbankApiError';
  }
}

class TbankValidationError extends TbankError {
  constructor(message, code, details) {
    super(message, code, details);
    this.name = 'TbankValidationError';
  }
}

class TbankNetworkError extends TbankError {
  constructor(message, code, details, originalError) {
    super(message, code, details);
    this.name = 'TbankNetworkError';
    this.originalError = originalError;
  }
}

class Tbank3DSError extends TbankError {
  constructor(message, code, details) {
    super(message, code, details);
    this.name = 'Tbank3DSError';
  }
}

class TbankKassaError extends TbankError {
  constructor(message, code, details) {
    super(message, code, details);
    this.name = 'TbankKassaError';
  }
}

module.exports = {
  TbankError,
  TbankApiError,
  TbankValidationError,
  TbankNetworkError,
  Tbank3DSError,
  TbankKassaError,
};
