const Joi = require('joi');

/**
 * Модуль для отмены платежей
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Отменить платеж
   * @see https://developer.tbank.ru/eacq/api/cancel
   */
  async cancelPayment(context, params) {
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
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/Cancel', params);
  },
};
