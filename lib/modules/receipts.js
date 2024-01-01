const Joi = require('joi');

/**
 * Модуль для работы с чеками
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Отправить закрывающий чек в кассу
   * @see https://developer.tbank.ru/eacq/api/send-closing-receipt
   */
  async sendClosingReceipt(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Receipt: Joi.object().required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/SendClosingReceipt', params);
  },

  /**
   * Получить статус отправки чека
   * @see https://developer.tbank.ru/eacq/api/metodi-raboti-s-chekami
   */
  async getReceiptState(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetReceiptState', params);
  },
};
