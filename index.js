const axios = require('axios');
const crypto = require('crypto');
const Joi = require('joi');

/**
 * T-Bank Payments API Client
 * Полная реализация API T-Bank для приема платежей
 */
class TbankPayments {
  constructor({ merchantId, secret, apiUrl = 'https://securepay.tinkoff.ru', logger = console }) {
    if (!merchantId || !secret) {
      throw new Error('merchantId и secret обязательны для инициализации');
    }
    
    this.merchantId = merchantId;
    this.secret = secret;
    this.apiUrl = apiUrl.replace(/\/$/, ''); // убираем trailing slash
    this.logger = logger;
    
    // Настройки axios по умолчанию
    this.axiosConfig = {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'tbank-payments-node/1.0.4'
      }
    };
  }

  /**
   * Генерация токена по алгоритму T-Bank API
   */
  generateToken(params) {
    // Собираем только корневые параметры, исключая вложенные объекты и массивы
    const rootParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (key !== 'Token' && typeof value !== 'object' && value !== undefined) {
        rootParams[key] = value;
      }
    }
    
    // Добавляем пароль (секрет)
    rootParams.Password = this.secret;
    
    // Сортируем по алфавиту по ключу и конкатенируем значения
    const sortedKeys = Object.keys(rootParams).sort();
    const concatenatedValues = sortedKeys.map(key => rootParams[key]).join('');
    
    // SHA-256
    return crypto.createHash('sha256').update(concatenatedValues, 'utf8').digest('hex');
  }

  /**
   * Базовый метод для выполнения запросов к API
   */
  async _request(path, data = {}) {
    // Автоматически добавляем TerminalKey если не указан
    if (!data.TerminalKey) {
      data.TerminalKey = this.merchantId;
    }

    // Автоматически генерируем токен если не указан
    if (!data.Token) {
      data.Token = this.generateToken(data);
    }

    const url = `${this.apiUrl}${path}`;
    
    try {
      this.logger.debug(`[T-Bank] Request: ${path}`, { data });
      
      const response = await axios.post(url, data, this.axiosConfig);
      
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
        status: err.response?.status
      });
      
      // Перебрасываем ошибку с дополнительной информацией
      if (err.response?.data) {
        const apiError = new Error(err.response.data.Message || err.response.data.Details || err.message);
        apiError.code = err.response.data.ErrorCode || err.response.status;
        apiError.details = err.response.data.Details;
        apiError.originalError = err;
        throw apiError;
      }
      
      throw err;
    }
  }

  /**
   * Валидация данных с помощью Joi
   */
  _validate(schema, data) {
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      const details = error.details.map(d => d.message).join('; ');
      throw new Error(`Ошибка валидации: ${details}`);
    }
  }

  // === ПЛАТЕЖИ ===

  /**
   * Инициация платежа
   */
  async initPayment(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      Amount: Joi.number().integer().min(1).required(),
      OrderId: Joi.string().required(),
      Description: Joi.string().max(250),
      PayForm: Joi.string(),
      CustomerKey: Joi.string(),
      Recurrent: Joi.string().valid('Y'),
      PayType: Joi.string().valid('O', 'T'),
      Language: Joi.string().valid('ru', 'en'),
      NotificationURL: Joi.string().uri(),
      SuccessURL: Joi.string().uri(),
      FailURL: Joi.string().uri(),
      RedirectDueDate: Joi.string(),
      Receipt: Joi.object(),
      DATA: Joi.object(),
      Shops: Joi.array(),
      Descriptor: Joi.string().max(256),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/Init', params);
  }

  /**
   * Подтверждение платежа
   */
  async confirmPayment(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Amount: Joi.number().integer().min(1),
      IP: Joi.string().ip(),
      Receipt: Joi.object(),
      Shops: Joi.array(),
      Route: Joi.string(),
      Source: Joi.string(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/Confirm', params);
  }

  /**
   * Отмена платежа
   */
  async cancelPayment(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Amount: Joi.number().integer().min(1),
      IP: Joi.string().ip(),
      Receipt: Joi.object(),
      Shops: Joi.array(),
      QrMemberId: Joi.string(),
      Route: Joi.string(),
      Source: Joi.string(),
      ExternalRequestId: Joi.string(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/Cancel', params);
  }

  /**
   * Получение статуса платежа
   */
  async getPaymentState(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      IP: Joi.string().ip(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetState', params);
  }

  /**
   * Проверка заказа
   */
  async checkOrder(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      OrderId: Joi.string().required(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/CheckOrder', params);
  }

  // === РАБОТА С КАРТАМИ ===

  /**
   * Завершение авторизации
   */
  async finishAuthorize(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      CardData: Joi.string().required(),
      IP: Joi.string().ip(),
      SendEmail: Joi.boolean(),
      Source: Joi.string(),
      DATA: Joi.object(),
      InfoEmail: Joi.string().email(),
      EncryptedPaymentData: Joi.string(),
      Amount: Joi.number().integer(),
      deviceChannel: Joi.string(),
      Route: Joi.string(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/FinishAuthorize', params);
  }

  /**
   * Рекуррентный платеж
   */
  async chargeRecurrent(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      RebillId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      IP: Joi.string().ip(),
      SendEmail: Joi.boolean(),
      InfoEmail: Joi.string().email(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/Charge', params);
  }

  // === КЛИЕНТЫ ===

  /**
   * Добавление клиента
   */
  async addCustomer(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      Email: Joi.string().email(),
      Phone: Joi.string(),
      IP: Joi.string().ip(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/AddCustomer', params);
  }

  /**
   * Получение данных клиента
   */
  async getCustomer(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      IP: Joi.string().ip(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetCustomer', params);
  }

  /**
   * Удаление клиента
   */
  async removeCustomer(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      IP: Joi.string().ip(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/RemoveCustomer', params);
  }

  // === УПРАВЛЕНИЕ КАРТАМИ ===

  /**
   * Добавление карты
   */
  async addCard(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      CheckType: Joi.string().valid('NO', '3DS', 'HOLD'),
      IP: Joi.string().ip(),
      ResidentState: Joi.boolean(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/AddCard', params);
  }

  /**
   * Привязка карты
   */
  async attachCard(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      RequestKey: Joi.string().required(),
      CardData: Joi.string().required(),
      DATA: Joi.object(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/AttachCard', params);
  }

  /**
   * Получение статуса добавления карты
   */
  async getAddCardState(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      RequestKey: Joi.string().required(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetAddCardState', params);
  }

  /**
   * Получение списка карт
   */
  async getCardList(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      SavedCard: Joi.boolean(),
      IP: Joi.string().ip(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetCardList', params);
  }

  /**
   * Удаление карты
   */
  async removeCard(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      CardId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      IP: Joi.string().ip(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/RemoveCard', params);
  }

  /**
   * Подтверждение карты случайной суммой
   */
  async submitRandomAmount(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      RequestKey: Joi.string().required(),
      Amount: Joi.number().integer().min(1).max(999).required(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/SubmitRandomAmount', params);
  }

  // === QR-КОДЫ И СБП ===

  /**
   * Получение QR-кода
   */
  async getQr(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      DataType: Joi.string().valid('PAYLOAD', 'IMAGE'),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetQr', params);
  }

  /**
   * Получение статуса QR-кода
   */
  async getQrState(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetQrState', params);
  }

  /**
   * Оплата через QR (СБП)
   */
  async chargeQr(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      AccountToken: Joi.string().required(),
      IP: Joi.string().ip(),
      SendEmail: Joi.boolean(),
      InfoEmail: Joi.string().email(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/ChargeQr', params);
  }

  /**
   * Тестирование СБП-платежа
   */
  async sbpPayTest(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      IsDeadlineExpired: Joi.boolean(),
      IsRejected: Joi.boolean(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/SbpPayTest', params);
  }

  /**
   * Список участников СБП
   */
  async getQrMembersList(params = {}) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/QrMembersList', params);
  }

  // === СТАТИЧЕСКИЕ QR-КОДЫ ===

  /**
   * Добавление статического QR-кода
   */
  async addAccountQr(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      AccountToken: Joi.string().required(),
      Description: Joi.string(),
      Data: Joi.object(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/AddAccountQr', params);
  }

  /**
   * Получение статуса добавления статического QR-кода
   */
  async getAddAccountQrState(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      RequestKey: Joi.string().required(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetAddAccountQrState', params);
  }

  /**
   * Получение списка статических QR-кодов
   */
  async getAccountQrList(params = {}) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetAccountQrList', params);
  }

  // === ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ===

  /**
   * Получение доступных способов оплаты терминала
   */
  async getTerminalPayMethods(params = {}) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/GetTerminalPayMethods', params);
  }

  /**
   * Получение операции подтверждения
   */
  async getConfirmOperation(params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CallbackUrl: Joi.string().uri(),
      PaymentIdList: Joi.array().items(Joi.number()),
      EmailList: Joi.array().items(Joi.string().email()),
      Token: Joi.string()
    });
    
    this._validate(schema, params);
    return this._request('/v2/getConfirmOperation', params);
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  /**
   * Проверка подписи уведомления
   */
  verifyNotificationSignature(notification, receivedToken) {
    const calculatedToken = this.generateToken(notification);
    return calculatedToken === receivedToken;
  }

  /**
   * Создание чека для платежа
   */
  createReceipt({ email, phone, taxation = 'osn', items }) {
    const receipt = {
      Email: email,
      Taxation: taxation,
      Items: items.map(item => ({
        Name: item.name,
        Price: item.price,
        Quantity: item.quantity || 1,
        Amount: item.amount || (item.price * (item.quantity || 1)),
        Tax: item.tax || 'none',
        Ean13: item.ean13
      }))
    };

    if (phone) {
      receipt.Phone = phone;
    }

    return receipt;
  }

  /**
   * Форматирование суммы в копейки
   */
  static amountToKopecks(rubles) {
    return Math.round(rubles * 100);
  }

  /**
   * Форматирование суммы из копеек в рубли
   */
  static kopecksToAmount(kopecks) {
    return kopecks / 100;
  }
}

module.exports = TbankPayments; 