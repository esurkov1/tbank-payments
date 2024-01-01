const crypto = require('crypto');

/**
 * Генерация токена по алгоритму T-Bank API
 * @param {Object} params - Параметры запроса
 * @param {string} secret - Секретный ключ
 * @returns {string} SHA-256 хеш токена
 */
function generateToken(params, secret) {
  // Собираем только корневые параметры, исключая вложенные объекты и массивы
  const rootParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (key !== 'Token' && typeof value !== 'object' && value !== undefined) {
      rootParams[key] = value;
    }
  }

  // Добавляем пароль (секрет)
  rootParams.Password = secret;

  // Сортируем по алфавиту по ключу и конкатенируем значения
  const sortedKeys = Object.keys(rootParams).sort();
  const concatenatedValues = sortedKeys.map((key) => rootParams[key]).join('');

  // SHA-256
  return crypto.createHash('sha256').update(concatenatedValues, 'utf8').digest('hex');
}

module.exports = {
  generateToken,
};
