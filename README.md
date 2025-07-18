# T-Bank Payments

[![npm version](https://badge.fury.io/js/tbank-payments.svg)](https://badge.fury.io/js/tbank-payments)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Полная библиотека для интеграции с **T-Bank Acquiring API** (ранее Тинькофф). Поддерживает все методы API для приема платежей, включая:

- 💳 Платежи банковскими картами
- 🏦 Система быстрых платежей (СБП)
- 🔄 Рекуррентные платежи
- 👥 Управление клиентами
- 💾 Управление привязанными картами
- 🔲 QR-коды для оплаты
- 📱 Статические QR-коды
- 🧾 Чеки (54-ФЗ)

## 🚀 Быстрый старт

### Установка

```bash
npm install tbank-payments
```

### Инициализация

```javascript
const TbankPayments = require('tbank-payments');

const tbank = new TbankPayments({
  merchantId: 'YOUR_TERMINAL_KEY',
  secret: 'YOUR_SECRET_KEY',
  apiUrl: 'https://securepay.tinkoff.ru' // необязательно, по умолчанию prod
});
```

### Простой платеж

```javascript
async function createPayment() {
  try {
    const payment = await tbank.initPayment({
      Amount: TbankPayments.amountToKopecks(100), // 100 рублей в копейках
      OrderId: 'order-123',
      Description: 'Оплата заказа #123',
      SuccessURL: 'https://yoursite.com/success',
      FailURL: 'https://yoursite.com/fail'
    });
    
    console.log('Payment URL:', payment.PaymentURL);
  } catch (error) {
    console.error('Payment error:', error.message);
  }
}

createPayment();
```

## 📚 Полная документация

### Платежи

#### Инициация платежа

```javascript
const payment = await tbank.initPayment({
  Amount: 50000, // 500 рублей в копейках
  OrderId: 'unique-order-id',
  Description: 'Описание товара/услуги',
  CustomerKey: 'customer-123', // для рекуррентных платежей
  Receipt: {
    Email: 'customer@email.com',
    Taxation: 'osn',
    Items: [{
      Name: 'Товар',
      Price: 50000,
      Quantity: 1,
      Tax: 'vat20'
    }]
  },
  SuccessURL: 'https://yoursite.com/success',
  FailURL: 'https://yoursite.com/fail',
  NotificationURL: 'https://yoursite.com/webhook'
});
```

#### Подтверждение двухстадийного платежа

```javascript
const result = await tbank.confirmPayment({
  PaymentId: payment.PaymentId,
  Amount: 50000 // необязательно, можно подтвердить частично
});
```

#### Отмена платежа

```javascript
const result = await tbank.cancelPayment({
  PaymentId: payment.PaymentId,
  Amount: 25000 // частичная отмена
});
```

#### Проверка статуса платежа

```javascript
const status = await tbank.getPaymentState({
  PaymentId: payment.PaymentId
});

console.log('Status:', status.Status);
console.log('Amount:', TbankPayments.kopecksToAmount(status.Amount));
```

### Работа с картами

#### Завершение авторизации (для PCI DSS)

```javascript
const result = await tbank.finishAuthorize({
  PaymentId: payment.PaymentId,
  CardData: encryptedCardData,
  SendEmail: true,
  InfoEmail: 'customer@email.com'
});
```

#### Рекуррентный платеж

```javascript
const recurrentPayment = await tbank.chargeRecurrent({
  PaymentId: newPayment.PaymentId,
  RebillId: previousPayment.RebillId
});
```

### Управление клиентами

#### Добавление клиента

```javascript
const customer = await tbank.addCustomer({
  CustomerKey: 'customer-123',
  Email: 'customer@email.com',
  Phone: '+79001234567'
});
```

#### Получение данных клиента

```javascript
const customer = await tbank.getCustomer({
  CustomerKey: 'customer-123'
});
```

#### Удаление клиента

```javascript
await tbank.removeCustomer({
  CustomerKey: 'customer-123'
});
```

### Управление картами

#### Добавление карты

```javascript
const cardRequest = await tbank.addCard({
  CustomerKey: 'customer-123',
  CheckType: '3DS'
});

// Перенаправьте клиента на cardRequest.PaymentURL для ввода данных карты
```

#### Привязка карты

```javascript
const result = await tbank.attachCard({
  RequestKey: cardRequest.RequestKey,
  CardData: encryptedCardData
});
```

#### Получение списка карт

```javascript
const cards = await tbank.getCardList({
  CustomerKey: 'customer-123'
});

console.log('Saved cards:', cards.Cards);
```

#### Удаление карты

```javascript
await tbank.removeCard({
  CustomerKey: 'customer-123',
  CardId: 'card-id'
});
```

### QR-коды и СБП

#### Получение QR-кода для платежа

```javascript
const qr = await tbank.getQr({
  PaymentId: payment.PaymentId,
  DataType: 'PAYLOAD' // или 'IMAGE' для base64 изображения
});

console.log('QR Data:', qr.Data);
```

#### Проверка статуса QR-платежа

```javascript
const qrStatus = await tbank.getQrState({
  PaymentId: payment.PaymentId
});
```

#### Список участников СБП

```javascript
const members = await tbank.getQrMembersList();
console.log('SBP Members:', members.Members);
```

### Статические QR-коды

#### Создание статического QR-кода

```javascript
const staticQr = await tbank.addAccountQr({
  AccountToken: 'account-token',
  Description: 'Статический QR для оплаты'
});
```

#### Получение списка статических QR-кодов

```javascript
const qrList = await tbank.getAccountQrList();
```

### Webhook уведомления

#### Проверка подписи webhook

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

## 🛠 Вспомогательные методы

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
      tax: 'vat20'
    },
    {
      name: 'Товар 2',
      price: 20000,
      quantity: 2,
      tax: 'vat10',
      ean13: '1234567890123'
    }
  ]
});
```

### Конвертация сумм

```javascript
// Рубли в копейки
const kopecks = TbankPayments.amountToKopecks(100.50); // 10050

// Копейки в рубли
const rubles = TbankPayments.kopecksToAmount(10050); // 100.5
```

## ⚙️ Конфигурация

### Параметры конструктора

```javascript
const tbank = new TbankPayments({
  merchantId: 'YOUR_TERMINAL_KEY',    // Ключ терминала
  secret: 'YOUR_SECRET_KEY',          // Секретный ключ
  apiUrl: 'https://securepay.tinkoff.ru', // URL API (необязательно)
  logger: customLogger                // Кастомный логгер (необязательно)
});
```

### Настройка логирования

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'tbank.log' })
  ]
});

const tbank = new TbankPayments({
  merchantId: 'YOUR_TERMINAL_KEY',
  secret: 'YOUR_SECRET_KEY',
  logger: logger
});
```

## 🧪 Тестирование

Для тестирования используйте тестовые реквизиты из документации T-Bank:

```javascript
// Тестовые данные карты
const testCard = '4300000000000777';
const testCvc = '123';
const testExpDate = '1224';

// Тестовый URL
const tbank = new TbankPayments({
  merchantId: 'YOUR_TEST_TERMINAL_KEY',
  secret: 'YOUR_TEST_SECRET_KEY',
  apiUrl: 'https://rest-api-test.tinkoff.ru'
});
```

## 📊 Статусы платежей

| Статус | Описание |
|--------|----------|
| `NEW` | Платеж создан |
| `FORM_SHOWED` | Показана форма оплаты |
| `AUTHORIZING` | Идет авторизация |
| `3DS_CHECKING` | Проходит 3-D Secure |
| `AUTHORIZED` | Авторизован (требует подтверждения) |
| `CONFIRMED` | Подтвержден |
| `REJECTED` | Отклонен |
| `CANCELED` | Отменен |
| `REFUNDED` | Возвращен |
| `PARTIAL_REFUNDED` | Частично возвращен |

## 🔒 Безопасность

- Все запросы автоматически подписываются
- Поддерживается проверка webhook-уведомлений
- Чувствительные данные логируются только в debug режиме
- Автоматическая генерация токенов

## 📝 Обработка ошибок

```javascript
try {
  const payment = await tbank.initPayment({
    Amount: 50000,
    OrderId: 'order-123'
  });
} catch (error) {
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Error details:', error.details);
}
```

## 🤝 Поддержка

- [Документация T-Bank API](https://www.tbank.ru/kassa/develop/)
- [Issues на GitHub](https://github.com/esurkov1/tbank-payments/issues)

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)