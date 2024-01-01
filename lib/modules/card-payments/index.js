const Joi = require('joi');

/**
 * Модуль для приема платежей по карте
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Завершение авторизации
   * @see https://developer.tbank.ru/eacq/api/finish-authorize
   */
  async finishAuthorize(context, params) {
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
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/FinishAuthorize', params);
  },
};
