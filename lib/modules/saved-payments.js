const Joi = require('joi');

/**
 * Модуль для проведения платежей по сохраненным реквизитам
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Провести платеж по сохраненным реквизитам
   * @see https://developer.tbank.ru/eacq/api/charge
   */
  async chargeRecurrent(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      RebillId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      IP: Joi.string().ip(),
      SendEmail: Joi.boolean(),
      InfoEmail: Joi.string().email(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/Charge', params);
  },

  /**
   * Автоплатеж по QR СБП
   * @see https://developer.tbank.ru/eacq/api/charge-qr
   */
  async chargeQr(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      AccountToken: Joi.string().required(),
      IP: Joi.string().ip(),
      SendEmail: Joi.boolean(),
      InfoEmail: Joi.string().email(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/ChargeQr', params);
  },
};
