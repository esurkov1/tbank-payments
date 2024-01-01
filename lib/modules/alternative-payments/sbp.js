const Joi = require('joi');

/**
 * Модуль для работы с СБП (Система быстрых платежей)
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Сформировать QR
   * @see https://developer.tbank.ru/eacq/api/get-qr
   */
  async getQr(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      DataType: Joi.string().valid('PAYLOAD', 'IMAGE'),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetQr', params);
  },

  /**
   * Получить статус QR-кода
   * @see https://developer.tbank.ru/eacq/api/get-qr-state
   */
  async getQrState(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetQrState', params);
  },

  /**
   * Получить список банков-пользователей QR для возврата
   * @see https://developer.tbank.ru/eacq/api/get-qr-bank-list
   */
  async getQrBankList(context, params = {}) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetQrBankList', params);
  },

  /**
   * Привязать счет к магазину
   * @see https://developer.tbank.ru/eacq/api/add-account
   */
  async addAccount(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      Description: Joi.string(),
      NotificationURL: Joi.string().uri(),
      SuccessURL: Joi.string().uri(),
      FailURL: Joi.string().uri(),
      DATA: Joi.object(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/AddAccount', params);
  },

  /**
   * Получить статус привязки счета к магазину
   * @see https://developer.tbank.ru/eacq/api/get-add-account-state
   */
  async getAddAccountState(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      RequestKey: Joi.string().required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetAddAccountState', params);
  },

  /**
   * Получить список счетов, привязанных к магазину
   * @see https://developer.tbank.ru/eacq/api/get-account-qr-list
   */
  async getAccountQrList(context, params = {}) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetAccountQrList', params);
  },

  /**
   * Создать тестовую платежную сессию
   * @see https://developer.tbank.ru/eacq/api/sbp-pay-test
   */
  async sbpPayTest(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      IsDeadlineExpired: Joi.boolean(),
      IsRejected: Joi.boolean(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/SbpPayTest', params);
  },

  /**
   * Получить список банков-участников СБП для платежа
   * @see https://developer.tbank.ru/eacq/api/qr-members-list
   */
  async getQrMembersList(context, params = {}) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/QrMembersList', params);
  },
};
