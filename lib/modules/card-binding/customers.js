const Joi = require('joi');

/**
 * Модуль для работы с клиентами
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Зарегистрировать клиента
   * @see https://developer.tbank.ru/eacq/api/add-customer
   */
  async addCustomer(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      Email: Joi.string().email(),
      Phone: Joi.string(),
      IP: Joi.string().ip(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/AddCustomer', params);
  },

  /**
   * Получить данные клиента
   * @see https://developer.tbank.ru/eacq/api/get-customer
   */
  async getCustomer(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      IP: Joi.string().ip(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetCustomer', params);
  },

  /**
   * Удалить данные клиента
   * @see https://developer.tbank.ru/eacq/api/remove-customer
   */
  async removeCustomer(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      IP: Joi.string().ip(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/RemoveCustomer', params);
  },
};
