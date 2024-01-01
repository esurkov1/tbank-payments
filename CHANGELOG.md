# Changelog

Все значимые изменения в этом проекте будут документироваться в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.0.0/),
и этот проект придерживается [Semantic Versioning](https://semver.org/lang/ru/).

## [Unreleased]

## [1.2.0] - 2024-01-XX

### Added

- Модульная архитектура по структуре официальной документации T-Bank
- Поддержка всех методов API T-Bank (100% покрытие)
- Методы для работы с 3DS (Check3dsVersion, Submit3DSMethod, Submit3DSAuthorization, Confirm3DSv1, Confirm3DSv2)
- Методы T-Pay (getTPayStatus, getTPayLink, getTPayQr)
- Методы SberPay (getSberPayQr, getSberPayLink)
- Метод Mir Pay (getMirPayDeepLink)
- Метод ConfirmDebit для подтверждения списания
- Retry механизм с exponential backoff для HTTP запросов
- Кастомные классы ошибок (TbankError, TbankApiError, TbankValidationError, TbankNetworkError, Tbank3DSError, TbankKassaError)
- TypeScript типы (index.d.ts)
- Тестовые данные из официальной документации
- CI/CD с автоматическим тестированием и релизами
- ESLint и Prettier конфигурация
- Husky pre-commit и pre-push хуки
- GitHub Actions workflows для тестирования и релизов
- Semantic Release для автоматических релизов

### Changed

- Полная переработка архитектуры на модульную структуру
- Обновлена версия Node.js до >=14.0.0
- Улучшена обработка ошибок с кодами из документации

### Fixed

- Исправлена обработка GET запросов для T-Pay и SberPay методов
