const Joi = require('joi');

/**
 * Модуль для работы с Mir Pay
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Получить DeepLink
   * @see https://developer.tbank.ru/eacq/api/get-deep-link
   */
  async getMirPayDeepLink(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/MirPay/GetDeepLink', params);
  },
};
