const Joi = require('joi');

/**
 * Модуль для проведения платежей
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Инициация платежа
   * @see https://developer.tbank.ru/eacq/api/init
   */
  async initPayment(context, params) {
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
      OperationInitiatorType: Joi.string().valid('2', 'R', 'I', 'D', 'N'),
      RebillId: Joi.alternatives().try(Joi.string(), Joi.number()),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/Init', params);
  },

  /**
   * Подтверждение платежа
   * @see https://developer.tbank.ru/eacq/api/confirm
   */
  async confirmPayment(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Amount: Joi.number().integer().min(1),
      IP: Joi.string().ip(),
      Receipt: Joi.object(),
      Shops: Joi.array(),
      Route: Joi.string(),
      Source: Joi.string(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/Confirm', params);
  },

  /**
   * Подтверждение списания
   * @see https://developer.tbank.ru/eacq/api/confirm-debit
   */
  async confirmDebit(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Amount: Joi.number().integer().min(1),
      IP: Joi.string().ip(),
      Receipt: Joi.object(),
      Shops: Joi.array(),
      Route: Joi.string(),
      Source: Joi.string(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/ConfirmDebit', params);
  },
};
