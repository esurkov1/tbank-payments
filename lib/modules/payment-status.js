const Joi = require('joi');

/**
 * Модуль для получения статуса платежа или заказа
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Получить статус платежа
   * @see https://developer.tbank.ru/eacq/api/status
   */
  async getPaymentState(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      IP: Joi.string().ip(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetState', params);
  },

  /**
   * Получить статус заказа
   * @see https://developer.tbank.ru/eacq/api/check-order
   */
  async checkOrder(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      OrderId: Joi.string().required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/CheckOrder', params);
  },
};
