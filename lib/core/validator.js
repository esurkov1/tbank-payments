// Joi используется в методе _validate через require
// eslint-disable-next-line no-unused-vars
const Joi = require('joi');

/**
 * Валидация данных с помощью Joi
 * @param {Object} schema - Схема валидации Joi
 * @param {Object} data - Данные для валидации
 * @throws {Error} Ошибка валидации с деталями
 */
function validate(schema, data) {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => d.message).join('; ');
    throw new Error(`Ошибка валидации: ${details}`);
  }
}

module.exports = {
  validate,
};
