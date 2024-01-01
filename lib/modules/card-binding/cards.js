const Joi = require('joi');

/**
 * Модуль для работы с картами
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Инициировать привязку карты к клиенту
   * @see https://developer.tbank.ru/eacq/api/add-card
   */
  async addCard(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      CheckType: Joi.string().valid('NO', '3DS', 'HOLD'),
      IP: Joi.string().ip(),
      ResidentState: Joi.boolean(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/AddCard', params);
  },

  /**
   * Привязать карту
   * @see https://developer.tbank.ru/eacq/api/attach-card
   */
  async attachCard(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      RequestKey: Joi.string().required(),
      CardData: Joi.string().required(),
      DATA: Joi.object(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/AttachCard', params);
  },

  /**
   * Получить статус привязки карты
   * @see https://developer.tbank.ru/eacq/api/get-add-card-state
   */
  async getAddCardState(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      RequestKey: Joi.string().required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetAddCardState', params);
  },

  /**
   * Получить список карт клиента
   * @see https://developer.tbank.ru/eacq/api/get-card-list
   */
  async getCardList(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      SavedCard: Joi.boolean(),
      IP: Joi.string().ip(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/GetCardList', params);
  },

  /**
   * Удалить привязанную карту клиента
   * @see https://developer.tbank.ru/eacq/api/remove-card
   */
  async removeCard(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      CustomerKey: Joi.string().required(),
      CardId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      IP: Joi.string().ip(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/RemoveCard', params);
  },

  /**
   * Подтверждение карты случайной суммой
   * @see https://developer.tbank.ru/eacq/api/submit-random-amount
   */
  async submitRandomAmount(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      RequestKey: Joi.string().required(),
      Amount: Joi.number().integer().min(1).max(999).required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/SubmitRandomAmount', params);
  },
};
