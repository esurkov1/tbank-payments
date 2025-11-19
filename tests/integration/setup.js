// Setup для интеграционных тестов
// Здесь можно добавить общую настройку для интеграционных тестов

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
