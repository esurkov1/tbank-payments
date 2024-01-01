module.exports = {
  displayName: 'integration',
  testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
  testEnvironment: 'node',
  testTimeout: 60000, // Увеличиваем таймаут для интеграционных тестов
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.js'],
  // Интеграционные тесты могут быть нестабильными, поэтому не останавливаемся на ошибках
  bail: false,
};
