// Setup для интеграционных тестов
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
require('dotenv').config({ path: envPath });

// Проверка загрузки переменных окружения
if (!process.env.TEST_TERMINAL || !process.env.TEST_SECRET) {
  console.warn('⚠️  Переменные окружения не загружены из .env файла');
  console.warn(`   Путь к .env: ${envPath}`);
  console.warn('   Убедитесь, что файл .env существует и содержит TEST_TERMINAL и TEST_SECRET');
}

// Увеличиваем таймаут Jest для интеграционных тестов
jest.setTimeout(60000);

// Отключаем мокирование axios для реальных запросов
jest.unmock('axios');

// Подавляем console.error для ожидаемых ошибок в интеграционных тестах
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((...args) => {
    // Показываем ошибки только если они не связаны с T-Bank API
    const message = args.join(' ');
    if (!message.includes('[T-Bank]')) {
      originalError(...args);
    }
  });
});

afterAll(() => {
  console.error = originalError;
});
