const Joi = require('joi');

/**
 * Модуль для работы с 3DS
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Проверить версию 3DS
   * @see https://developer.tbank.ru/eacq/api/check-3-ds-version
   */
  async check3dsVersion(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      CardData: Joi.string().required(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/Check3dsVersion', params);
  },

  /**
   * Пройти этап 3DS Method
   * @see https://developer.tbank.ru/eacq/api/3-ds-method
   */
  async submit3DSMethod(context, params) {
    const schema = Joi.object({
      threeDSMethodData: Joi.string().required(),
    });

    context.validator.validate(schema, params);
    // Этот метод отправляется на другой URL (ACS)
    // Пока используем стандартный клиент, но может потребоваться отдельная логика
    return context.client.post('/v2/3DSMethod', params);
  },

  /**
   * Отправить запрос в банк-эмитент для прохождения 3DS
   * @see https://developer.tbank.ru/eacq/api/acs-url
   */
  async submit3DSAuthorization(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      MD: Joi.string(),
      PaRes: Joi.string(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/Submit3DSAuthorization', params);
  },

  /**
   * Подтвердить прохождение 3DS v1.0
   * @see https://developer.tbank.ru/eacq/api/submit-3-ds-authorization-v-1
   */
  async confirm3DSv1(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      MD: Joi.string(),
      PaRes: Joi.string(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/Submit3DSAuthorizationV1', params);
  },

  /**
   * Подтвердить прохождение 3DS v2.1
   * @see https://developer.tbank.ru/eacq/api/submit-3-ds-authorization-v-2
   */
  async confirm3DSv2(context, params) {
    const schema = Joi.object({
      TerminalKey: Joi.string(),
      PaymentId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      Cres: Joi.string(),
      Token: Joi.string(),
    });

    context.validator.validate(schema, params);
    return context.client.post('/v2/Submit3DSAuthorizationV2', params);
  },
};
