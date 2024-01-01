# T-Bank Payments

[![npm version](https://badge.fury.io/js/tbank-payments.svg)](https://badge.fury.io/js/tbank-payments)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/esurkov1/tbank-payments/workflows/Test/badge.svg)](https://github.com/esurkov1/tbank-payments/actions)
[![Coverage](https://codecov.io/gh/esurkov1/tbank-payments/branch/main/graph/badge.svg)](https://codecov.io/gh/esurkov1/tbank-payments)

**Официальная документация:** [https://developer.tbank.ru/eacq/api](https://developer.tbank.ru/eacq/api)

Полная библиотека для интеграции с **T-Bank Acquiring API** (ранее Тинькофф). Поддерживает 100% методов API для приема платежей, включая:

- 💳 Платежи банковскими картами
- 📱 T-Pay, SberPay, Mir Pay, Система быстрых платежей (СБП)
- 🔗 Привязка счета СБП или карты для автоплатежей
- 📋 Рекуррентные платежи по сохраненным реквизитам (COF-операции) (СБП/карты)
- 👥 Управление клиентами
- 💾 Управление привязанными картами
- 🔲 QR-коды для оплаты
- 🧾 Чеки (54-ФЗ)
- 🔐 Методы для работы с 3DS

## Introduction

### Установка

```bash
npm install tbank-payments
```

### Быстрый старт

```javascript
const TbankPayments = require('tbank-payments');

const tbank = new TbankPayments({
  merchantId: 'YOUR_TERMINAL_KEY',
  secret: 'YOUR_SECRET_KEY',
});

// Простой платеж
const payment = await tbank.initPayment({
  Amount: TbankPayments.amountToKopecks(100), // 100 рублей в копейках
  OrderId: 'order-123',
  Description: 'Оплата заказа #123',
  SuccessURL: 'https://yoursite.com/success',
  FailURL: 'https://yoursite.com/fail',
});

console.log('Payment URL:', payment.PaymentURL);
```

## Проведение платежа

### Инициировать платеж

Метод создает новый платеж и возвращает URL для перенаправления клиента на страницу оплаты.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/init](https://developer.tbank.ru/eacq/api/init)

```javascript
const payment = await tbank.initPayment({
  Amount: 50000, // 500 рублей в копейках
  OrderId: 'unique-order-id',
  Description: 'Описание товара/услуги',
  CustomerKey: 'customer-123', // для рекуррентных платежей
  Receipt: {
    Email: 'customer@email.com',
    Taxation: 'osn',
    Items: [
      {
        Name: 'Товар',
        Price: 50000,
        Quantity: 1,
        Tax: 'vat20',
      },
    ],
  },
  SuccessURL: 'https://yoursite.com/success',
  FailURL: 'https://yoursite.com/fail',
  NotificationURL: 'https://yoursite.com/webhook',
});
```

### Подтвердить платеж

Метод подтверждает двухстадийный платеж.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/confirm](https://developer.tbank.ru/eacq/api/confirm)

```javascript
const result = await tbank.confirmPayment({
  PaymentId: payment.PaymentId,
  Amount: 50000, // необязательно, можно подтвердить частично
});
```

### Подтвердить списание

Метод подтверждает списание средств.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/confirm-debit](https://developer.tbank.ru/eacq/api/confirm-debit)

```javascript
const result = await tbank.confirmDebit({
  PaymentId: payment.PaymentId,
  Amount: 50000,
});
```

## Прием платежей по карте

### Завершение авторизации

Метод завершает авторизацию платежа с данными карты.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/finish-authorize](https://developer.tbank.ru/eacq/api/finish-authorize)

```javascript
const result = await tbank.finishAuthorize({
  PaymentId: payment.PaymentId,
  CardData: encryptedCardData,
  SendEmail: true,
  InfoEmail: 'customer@email.com',
});
```

### Методы для работы с 3DS

#### Проверить версию 3DS

Метод возвращает версию протокола 3DS, по которому может аутентифицироваться карта.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/check-3-ds-version](https://developer.tbank.ru/eacq/api/check-3-ds-version)

```javascript
const version = await tbank.check3dsVersion({
  PaymentId: payment.PaymentId,
  CardData: 'PAN=4300000000000777;ExpDate=0519;CardHolder=IVAN PETROV;CVV=111',
});
```

#### Пройти этап 3DS Method

Метод для сбора информации ACS-ом о девайсе.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/3-ds-method](https://developer.tbank.ru/eacq/api/3-ds-method)

```javascript
const result = await tbank.submit3DSMethod({
  threeDSMethodData: base64EncodedData,
});
```

#### Отправить запрос в банк-эмитент для прохождения 3DS

Метод отправляет запрос в банк-эмитент для прохождения 3DS аутентификации.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/acs-url](https://developer.tbank.ru/eacq/api/acs-url)

```javascript
const result = await tbank.submit3DSAuthorization({
  PaymentId: payment.PaymentId,
  MD: mdValue,
  PaRes: paResValue,
});
```

#### Подтвердить прохождение 3DS v1.0

Метод подтверждает прохождение 3DS версии 1.0.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/submit-3-ds-authorization-v-1](https://developer.tbank.ru/eacq/api/submit-3-ds-authorization-v-1)

```javascript
const result = await tbank.confirm3DSv1({
  PaymentId: payment.PaymentId,
  MD: mdValue,
  PaRes: paResValue,
});
```

#### Подтвердить прохождение 3DS v2.1

Метод подтверждает прохождение 3DS версии 2.1.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/submit-3-ds-authorization-v-2](https://developer.tbank.ru/eacq/api/submit-3-ds-authorization-v-2)

```javascript
const result = await tbank.confirm3DSv2({
  PaymentId: payment.PaymentId,
  Cres: cresValue,
});
```

## Другие способы приема платежей

### СБП (Система быстрых платежей)

#### Сформировать QR

Метод формирует QR-код для оплаты через СБП.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-qr](https://developer.tbank.ru/eacq/api/get-qr)

```javascript
const qr = await tbank.getQr({
  PaymentId: payment.PaymentId,
  DataType: 'PAYLOAD', // или 'IMAGE' для base64 изображения
});
```

#### Получить статус QR-кода

Метод возвращает статус QR-платежа.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-qr-state](https://developer.tbank.ru/eacq/api/get-qr-state)

```javascript
const qrStatus = await tbank.getQrState({
  PaymentId: payment.PaymentId,
});
```

#### Получить список банков-пользователей QR для возврата

Метод возвращает список банков для возврата средств через QR.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-qr-bank-list](https://developer.tbank.ru/eacq/api/get-qr-bank-list)

```javascript
const banks = await tbank.getQrBankList();
```

#### Привязать счет к магазину

Метод инициирует процесс привязки счета клиента через СБП для автоплатежей.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/add-account](https://developer.tbank.ru/eacq/api/add-account)

```javascript
const account = await tbank.addAccount({
  CustomerKey: 'customer-123',
  Description: 'Привязка счета для автоплатежей',
  SuccessURL: 'https://yoursite.com/success',
  FailURL: 'https://yoursite.com/fail',
  NotificationURL: 'https://yoursite.com/webhook',
});
```

#### Получить статус привязки счета к магазину

Метод проверяет статус привязки счета.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-add-account-state](https://developer.tbank.ru/eacq/api/get-add-account-state)

```javascript
const status = await tbank.getAddAccountState({
  RequestKey: 'request-key-from-notification',
});
```

#### Получить список счетов, привязанных к магазину

Метод возвращает список всех привязанных счетов.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-account-qr-list](https://developer.tbank.ru/eacq/api/get-account-qr-list)

```javascript
const accounts = await tbank.getAccountQrList();
```

#### Создать тестовую платежную сессию

Метод создает тестовую сессию для тестирования СБП платежей.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/sbp-pay-test](https://developer.tbank.ru/eacq/api/sbp-pay-test)

```javascript
const test = await tbank.sbpPayTest({
  PaymentId: payment.PaymentId,
  IsDeadlineExpired: false,
  IsRejected: false,
});
```

#### Получить список банков-участников СБП для платежа

Метод возвращает список банков-участников СБП.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/qr-members-list](https://developer.tbank.ru/eacq/api/qr-members-list)

```javascript
const members = await tbank.getQrMembersList();
```

### T-Pay

#### Определить возможность проведения платежа

Метод определяет возможность проведения платежа T-Pay на терминале.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/status](https://developer.tbank.ru/eacq/api/status)

```javascript
const status = await tbank.getTPayStatus();
```

#### Получить ссылку

Метод генерирует ссылку для безусловного редиректа на мобильных устройствах.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/link](https://developer.tbank.ru/eacq/api/link)

```javascript
const link = await tbank.getTPayLink({
  paymentId: payment.PaymentId,
  version: '2.0',
});
```

#### Получить QR

Метод генерирует QR для десктопов.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/qr](https://developer.tbank.ru/eacq/api/qr)

```javascript
const qr = await tbank.getTPayQr({
  paymentId: payment.PaymentId,
});
```

### SberPay

#### Получить QR

Метод генерирует QR-код для оплаты через SberPay.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/sber-pay-qr](https://developer.tbank.ru/eacq/api/sber-pay-qr)

```javascript
const qr = await tbank.getSberPayQr({
  paymentId: payment.PaymentId,
});
```

#### Получить ссылку

Метод генерирует ссылку для оплаты через SberPay.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/sber-paylink](https://developer.tbank.ru/eacq/api/sber-paylink)

```javascript
const link = await tbank.getSberPayLink({
  paymentId: payment.PaymentId,
  version: '2.0',
});
```

### Mir Pay

#### Получить DeepLink

Метод генерирует DeepLink для оплаты через Mir Pay.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-deep-link](https://developer.tbank.ru/eacq/api/get-deep-link)

```javascript
const deepLink = await tbank.getMirPayDeepLink({
  PaymentId: payment.PaymentId,
});
```

## Привязка карты

### Методы работы с клиентами

#### Зарегистрировать клиента

Метод регистрирует нового клиента в системе.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/add-customer](https://developer.tbank.ru/eacq/api/add-customer)

```javascript
const customer = await tbank.addCustomer({
  CustomerKey: 'customer-123',
  Email: 'customer@email.com',
  Phone: '+79001234567',
});
```

#### Получить данные клиента

Метод возвращает данные зарегистрированного клиента.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-customer](https://developer.tbank.ru/eacq/api/get-customer)

```javascript
const customer = await tbank.getCustomer({
  CustomerKey: 'customer-123',
});
```

#### Удалить данные клиента

Метод удаляет данные клиента из системы.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/remove-customer](https://developer.tbank.ru/eacq/api/remove-customer)

```javascript
await tbank.removeCustomer({
  CustomerKey: 'customer-123',
});
```

### Методы работы с картами

#### Инициировать привязку карты к клиенту

Метод инициирует процесс привязки карты к клиенту.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/add-card](https://developer.tbank.ru/eacq/api/add-card)

```javascript
const cardRequest = await tbank.addCard({
  CustomerKey: 'customer-123',
  CheckType: '3DS',
});
```

#### Привязать карту

Метод привязывает карту к клиенту.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/attach-card](https://developer.tbank.ru/eacq/api/attach-card)

```javascript
const result = await tbank.attachCard({
  RequestKey: cardRequest.RequestKey,
  CardData: encryptedCardData,
});
```

#### Получить статус привязки карты

Метод проверяет статус процесса привязки карты.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-add-card-state](https://developer.tbank.ru/eacq/api/get-add-card-state)

```javascript
const status = await tbank.getAddCardState({
  RequestKey: cardRequest.RequestKey,
});
```

#### Получить список карт клиента

Метод возвращает список всех привязанных карт клиента.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-card-list](https://developer.tbank.ru/eacq/api/get-card-list)

```javascript
const cards = await tbank.getCardList({
  CustomerKey: 'customer-123',
});
```

#### Удалить привязанную карту клиента

Метод удаляет привязанную карту клиента.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/remove-card](https://developer.tbank.ru/eacq/api/remove-card)

```javascript
await tbank.removeCard({
  CustomerKey: 'customer-123',
  CardId: 'card-id',
});
```

## Проведение платежа по сохраненным реквизитам

### Провести платеж по сохраненным реквизитам

Метод проводит платеж с использованием ранее сохраненных реквизитов карты.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/charge](https://developer.tbank.ru/eacq/api/charge)

```javascript
const recurrentPayment = await tbank.chargeRecurrent({
  PaymentId: newPayment.PaymentId,
  RebillId: previousPayment.RebillId,
});
```

### Автоплатеж по QR СБП

Метод проводит автоплатеж через СБП с использованием привязанного счета.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/charge-qr](https://developer.tbank.ru/eacq/api/charge-qr)

```javascript
const autopay = await tbank.chargeQr({
  PaymentId: payment.PaymentId,
  AccountToken: 'account-token-from-addAccount-notification',
  SendEmail: true,
  InfoEmail: 'customer@example.com',
});
```

## Отмена платежа

### Отменить платеж

Метод отменяет платеж полностью или частично.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/cancel](https://developer.tbank.ru/eacq/api/cancel)

```javascript
const result = await tbank.cancelPayment({
  PaymentId: payment.PaymentId,
  Amount: 25000, // частичная отмена
});
```

## Статус платежа или заказа

### Получить статус платежа

Метод возвращает текущий статус платежа.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/status](https://developer.tbank.ru/eacq/api/status)

```javascript
const status = await tbank.getPaymentState({
  PaymentId: payment.PaymentId,
});

console.log('Status:', status.Status);
console.log('Amount:', TbankPayments.kopecksToAmount(status.Amount));
```

### Получить статус заказа

Метод возвращает статус всех платежей по заказу.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/check-order](https://developer.tbank.ru/eacq/api/check-order)

```javascript
const orderStatus = await tbank.checkOrder({
  OrderId: 'order-123',
});
```

## Справка по операции

### Получить справку по операции

Метод генерирует справку по операции для конкретного платежа или списка платежей.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/get-confirm-operation](https://developer.tbank.ru/eacq/api/get-confirm-operation)

```javascript
// Отправка справки на email
const receipt = await tbank.getConfirmOperation({
  PaymentIdList: [12345678, 12345679],
  EmailList: ['customer@example.com'],
});

// Получение справки через callback URL
const receiptCallback = await tbank.getConfirmOperation({
  PaymentIdList: [12345678],
  CallbackUrl: 'https://yoursite.com/receipt-callback',
});
```

## Методы работы с чеками

### Отправить закрывающий чек в кассу

Метод отправляет закрывающий чек (чек возврата или коррекции) в кассу.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/send-closing-receipt](https://developer.tbank.ru/eacq/api/send-closing-receipt)

```javascript
const receipt = await tbank.sendClosingReceipt({
  PaymentId: 12345678,
  Receipt: {
    Email: 'customer@example.com',
    Taxation: 'osn',
    Items: [
      {
        Name: 'Возврат товара',
        Price: 10000,
        Quantity: 1,
        Amount: 10000,
        Tax: 'vat20',
      },
    ],
  },
});
```

### Получить статус отправки чека

Метод проверяет статус отправки чека в кассу.

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/api/metodi-raboti-s-chekami](https://developer.tbank.ru/eacq/api/metodi-raboti-s-chekami)

```javascript
const receiptStatus = await tbank.getReceiptState({
  PaymentId: 12345678,
});
```

## Обработка ошибок

Библиотека использует кастомные классы ошибок для удобной обработки:

```javascript
try {
  await tbank.initPayment({
    Amount: 50000,
    OrderId: 'order-123',
  });
} catch (error) {
  if (error.name === 'TbankApiError') {
    console.error('API Error:', error.code, error.message);
    console.error('Details:', error.details);
  } else if (error.name === 'TbankValidationError') {
    console.error('Validation Error:', error.message);
  } else if (error.name === 'TbankNetworkError') {
    console.error('Network Error:', error.message);
  }
}
```

## Webhook уведомления

### Проверка подписи webhook

```javascript
// В вашем webhook endpoint
app.post('/webhook', (req, res) => {
  const notification = req.body;
  const receivedToken = notification.Token;

  // Проверяем подпись
  if (tbank.verifyNotificationSignature(notification, receivedToken)) {
    console.log('Valid notification:', notification.Status);

    // Обрабатываем уведомление
    switch (notification.Status) {
      case 'CONFIRMED':
        // Платеж успешно подтвержден
        break;
      case 'REJECTED':
        // Платеж отклонен
        break;
    }

    res.send('OK');
  } else {
    res.status(400).send('Invalid signature');
  }
});
```

## Тестирование

Для тестирования используйте тестовые реквизиты из документации T-Bank.

### Тест-кейсы

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/intro/errors/test-cases](https://developer.tbank.ru/eacq/intro/errors/test-cases)

Для прохождения тест-кейсов используйте тестовый терминал с приставкой `DEMO`. Запросы с него нужно отправлять на боевую среду — `https://securepay.tinkoff.ru/v2`.

**Важно:**

- При тестировании платежей в методе Инициировать платеж нельзя передавать параметры, которые противоречат настройкам терминала
- В запросе метода Инициировать платеж не нужно передавать `Recurrent = Y` — признак родительского рекуррентного платежа не позволит пройти тест-кейс
- При получении ошибки «Ошибка уведомлении: не получаем ответ ОК на следующие уведомлении: REJECTED» проверьте правильность передачи ответа на уведомление. Верный ответ — `200:ОК`, без тегов, заглавными английскими буквами

### Тестирование СБП

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/intro/errors/test-sbp](https://developer.tbank.ru/eacq/intro/errors/test-sbp)

Доступны следующие сценарии:

- Платеж — успех
- Платеж — отказ по таймауту
- Платеж — отказ, отклонен со стороны Т-Бизнеса
- Возврат — успех

### Коды ошибок

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/intro/errors/error-codes](https://developer.tbank.ru/eacq/intro/errors/error-codes)

Библиотека включает маппинг кодов ошибок из официальной документации. Используйте `lib/test-data/test-scenarios.js` для доступа к кодам ошибок в тестах.

### Ошибки 3DS

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/intro/errors/3ds](https://developer.tbank.ru/eacq/intro/errors/3ds)

При работе с методами 3DS могут возникать специфичные ошибки. Все коды ошибок 3DS доступны в `lib/test-data/test-scenarios.js`.

### Ошибки онлайн-кассы

**Ссылка на документацию:** [https://developer.tbank.ru/eacq/intro/errors/kassa](https://developer.tbank.ru/eacq/intro/errors/kassa)

При работе с чеками могут возникать ошибки кассы. Все коды ошибок доступны в `lib/test-data/test-scenarios.js`.

## Вспомогательные методы

### Создание чека

```javascript
const receipt = tbank.createReceipt({
  email: 'customer@email.com',
  phone: '+79001234567', // необязательно
  taxation: 'osn',
  items: [
    {
      name: 'Товар 1',
      price: 30000, // в копейках
      quantity: 1,
      tax: 'vat20',
    },
    {
      name: 'Товар 2',
      price: 20000,
      quantity: 2,
      tax: 'vat10',
      ean13: '1234567890123',
    },
  ],
});
```

### Конвертация сумм

```javascript
// Рубли в копейки
const kopecks = TbankPayments.amountToKopecks(100.5); // 10050

// Копейки в рубли
const rubles = TbankPayments.kopecksToAmount(10050); // 100.5
```

## Конфигурация

### Параметры конструктора

```javascript
const tbank = new TbankPayments({
  merchantId: 'YOUR_TERMINAL_KEY', // Ключ терминала (обязательно)
  secret: 'YOUR_SECRET_KEY', // Секретный ключ (обязательно)
  apiUrl: 'https://securepay.tinkoff.ru', // URL API (необязательно)
  logger: customLogger, // Кастомный логгер (необязательно)
  retryConfig: {
    // Настройки retry (необязательно)
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
  },
});
```

### Настройка логирования

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'tbank.log' })],
});

const tbank = new TbankPayments({
  merchantId: 'YOUR_TERMINAL_KEY',
  secret: 'YOUR_SECRET_KEY',
  logger: logger,
});
```

## Статусы платежей

| Статус             | Описание                            |
| ------------------ | ----------------------------------- |
| `NEW`              | Платеж создан                       |
| `FORM_SHOWED`      | Показана форма оплаты               |
| `AUTHORIZING`      | Идет авторизация                    |
| `3DS_CHECKING`     | Проходит 3-D Secure                 |
| `AUTHORIZED`       | Авторизован (требует подтверждения) |
| `CONFIRMED`        | Подтвержден                         |
| `REJECTED`         | Отклонен                            |
| `CANCELED`         | Отменен                             |
| `REFUNDED`         | Возвращен                           |
| `PARTIAL_REFUNDED` | Частично возвращен                  |

## Платежи по сохраненным реквизитам (COF-операции)

Библиотека поддерживает все типы COF-операций:

| Тип операции           | OperationInitiatorType | Описание                                  |
| ---------------------- | ---------------------- | ----------------------------------------- |
| CIT COF                | `'2'`                  | Разовый платеж, инициированный клиентом   |
| MIT COF Recurring      | `'R'`                  | Регулярные платежи без графика (подписки) |
| MIT COF Installment    | `'I'`                  | Платежи по графику (рассрочка)            |
| MIT COF Delayed-Charge | `'D'`                  | Отсроченное списание (доначисления)       |
| MIT COF No-Show        | `'N'`                  | Плата за неявку                           |

**Важно:** Для использования COF-операций необходимо включить эту возможность на терминале. Обратитесь к персональному менеджеру или на acq_help@tbank.ru.

## Автоплатежи через СБП

Библиотека поддерживает автоплатежи через Систему быстрых платежей (СБП). Автоплатежи работают только по одностадийной схеме оплаты.

**Сценарий использования:**

1. Привязать счет клиента через `addAccount`
2. Получить `AccountToken` в уведомлении о привязке
3. Создать платеж через `initPayment` с параметрами `Recurrent=Y` и `DATA={"QR":"true"}`
4. Провести автоплатеж через `chargeQr` с `AccountToken`

Подробнее: [Документация по автоплатежам](https://developer.tbank.ru/eacq/scenarios/payments/PCI_DSS/autopay)

## Автор

Разработчик: **Eugene Surkov**

Telegram: [@esurkov1](https://t.me/esurkov1)

## Безопасность

- Все запросы автоматически подписываются
- Поддерживается проверка webhook-уведомлений
- Чувствительные данные логируются только в debug режиме
- Автоматическая генерация токенов
- Retry механизм с exponential backoff для надежности

## Поддержка

- [Документация T-Bank API](https://developer.tbank.ru/eacq/api)
- [Issues на GitHub](https://github.com/esurkov1/tbank-payments/issues)

## Лицензия

MIT License - см. файл [LICENSE](LICENSE)
