const Joi = require('joi');

/**
 * Модуль для получения справки по операции
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Получить справку по операции
   * @see https://developer.tbank.ru/eacq/api/get-confirm-operation
   */
  async getConfirmOperation(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CallbackUrl: Joi.string().uri(),
      PaymentIdList: Joi.array().items(Joi.number()),
      EmailList: Joi.array().items(Joi.string().email()),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetConfirmOperation', params);
  },
};
