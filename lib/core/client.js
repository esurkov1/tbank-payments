const axios = require('axios');
const axiosRetry = require('axios-retry');

/**
 * Базовый HTTP клиент для работы с T-Bank API
 */
class HttpClient {
  constructor({ apiUrl, merchantId, secret, tokenGenerator, logger, retryConfig = {} }) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // убираем trailing slash
    this.merchantId = merchantId;
    this.secret = secret;
    this.tokenGenerator = tokenGenerator;
    this.logger = logger || console;

    // Настройки axios по умолчанию
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'tbank-payments-node/1.2.0',
      },
    });

    // Настройка retry механизма
    const defaultRetryConfig = {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response && error.response.status >= 500 && error.response.status < 600),
      ...retryConfig,
    };

    // Применяем retry механизм только если axiosInstance имеет interceptors
    if (this.axiosInstance && this.axiosInstance.interceptors) {
      const retry = axiosRetry.default || axiosRetry;
      retry(this.axiosInstance, defaultRetryConfig);
    }
  }

  /**
   * Выполнение POST запроса
   * @param {string} path - Путь API
   * @param {Object} data - Данные запроса
   * @returns {Promise<Object>} Ответ API
   */
  async post(path, data = {}) {
    const requestData = { ...data };

    // Автоматически добавляем TerminalKey если не указан
    if (!requestData.TerminalKey) {
      requestData.TerminalKey = this.merchantId;
    }

    // Автоматически генерируем токен если не указан
    if (!requestData.Token) {
      requestData.Token = this.tokenGenerator(requestData, this.secret);
    }

    const url = `${this.apiUrl}${path}`;

    try {
      this.logger.debug(`[T-Bank] Request: ${path}`, { data: requestData });

      const response = await this.axiosInstance.post(url, requestData);

      this.logger.debug(`[T-Bank] Response: ${path}`, { data: response.data });

      // Проверяем на ошибки в ответе
      if (response.data.Success === false) {
        const error = new Error(response.data.Message || response.data.Details || 'API Error');
        error.code = response.data.ErrorCode;
        error.details = response.data.Details;
        throw error;
      }

      return response.data;
    } catch (err) {
      this.logger.error(`[T-Bank] Error: ${path}`, {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Перебрасываем ошибку с дополнительной информацией
      if (err.response?.data) {
        const apiError = new Error(
          err.response.data.Message || err.response.data.Details || err.message
        );
        apiError.code = err.response.data.ErrorCode || err.response.status;
        apiError.details = err.response.data.Details;
        apiError.originalError = err;
        throw apiError;
      }

      throw err;
    }
  }

  /**
   * Выполнение GET запроса
   * @param {string} path - Путь API
   * @param {Object} params - Query параметры
   * @returns {Promise<Object>} Ответ API
   */
  async get(path, params = {}) {
    const url = `${this.apiUrl}${path}`;

    try {
      this.logger.debug(`[T-Bank] GET Request: ${path}`, { params });

      const response = await this.axiosInstance.get(url, { params });

      this.logger.debug(`[T-Bank] GET Response: ${path}`, { data: response.data });

      return response.data;
    } catch (err) {
      this.logger.error(`[T-Bank] GET Error: ${path}`, {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      if (err.response?.data) {
        const apiError = new Error(
          err.response.data.Message || err.response.data.Details || err.message
        );
        apiError.code = err.response.data.ErrorCode || err.response.status;
        apiError.details = err.response.data.Details;
        apiError.originalError = err;
        throw apiError;
      }

      throw err;
    }
  }
}

module.exports = HttpClient;
