const TbankPayments = require('./index');

// Инициализация клиента
const tbank = new TbankPayments({
  merchantId: 'YOUR_TERMINAL_KEY',
  secret: 'YOUR_SECRET_KEY',
  // apiUrl: 'https://rest-api-test.tinkoff.ru' // для тестирования
});

// Пример 1: Простой платеж
async function createSimplePayment() {
  try {
    console.log('=== Создание простого платежа ===');

    const payment = await tbank.initPayment({
      Amount: TbankPayments.amountToKopecks(100), // 100 рублей
      OrderId: `order-${Date.now()}`,
      Description: 'Тестовый платеж',
      SuccessURL: 'https://yoursite.com/success',
      FailURL: 'https://yoursite.com/fail',
    });

    console.log('Платеж создан:', payment.PaymentId);
    console.log('Ссылка для оплаты:', payment.PaymentURL);

    return payment;
  } catch (error) {
    console.error('Ошибка создания платежа:', error.message);
  }
}

// Пример 2: Платеж с чеком
async function createPaymentWithReceipt() {
  try {
    console.log('\n=== Создание платежа с чеком ===');

    // Создаем чек
    const receipt = tbank.createReceipt({
      email: 'customer@example.com',
      phone: '+79001234567',
      taxation: 'osn',
      items: [
        {
          name: 'Товар 1',
          price: TbankPayments.amountToKopecks(50),
          quantity: 1,
          tax: 'vat20',
        },
        {
          name: 'Товар 2',
          price: TbankPayments.amountToKopecks(25),
          quantity: 2,
          tax: 'vat10',
        },
      ],
    });

    const payment = await tbank.initPayment({
      Amount: TbankPayments.amountToKopecks(100),
      OrderId: `order-receipt-${Date.now()}`,
      Description: 'Платеж с чеком',
      Receipt: receipt,
      SuccessURL: 'https://yoursite.com/success',
      FailURL: 'https://yoursite.com/fail',
    });

    console.log('Платеж с чеком создан:', payment.PaymentId);
    console.log('Чек:', JSON.stringify(receipt, null, 2));

    return payment;
  } catch (error) {
    console.error('Ошибка создания платежа с чеком:', error.message);
  }
}

// Пример 3: Проверка статуса платежа
async function checkPaymentStatus(paymentId) {
  try {
    console.log('\n=== Проверка статуса платежа ===');

    const status = await tbank.getPaymentState({
      PaymentId: paymentId,
    });

    console.log('Статус платежа:', status.Status);
    console.log('Сумма:', TbankPayments.kopecksToAmount(status.Amount), 'руб.');

    return status;
  } catch (error) {
    console.error('Ошибка получения статуса:', error.message);
  }
}

// Пример 4: Работа с клиентами
async function manageCustomer() {
  try {
    console.log('\n=== Управление клиентами ===');

    const customerKey = `customer-${Date.now()}`;

    // Добавляем клиента
    const customer = await tbank.addCustomer({
      CustomerKey: customerKey,
      Email: 'customer@example.com',
      Phone: '+79001234567',
    });

    console.log('Клиент добавлен:', customer.Success);

    // Получаем информацию о клиенте
    const customerInfo = await tbank.getCustomer({
      CustomerKey: customerKey,
    });

    console.log('Информация о клиенте:', customerInfo.Email);

    return customerKey;
  } catch (error) {
    console.error('Ошибка управления клиентом:', error.message);
  }
}

// Пример 5: Работа с картами
async function manageCards(customerKey) {
  try {
    console.log('\n=== Управление картами ===');

    // Инициируем добавление карты
    const cardRequest = await tbank.addCard({
      CustomerKey: customerKey,
      CheckType: '3DS',
    });

    console.log('Запрос на добавление карты:', cardRequest.RequestKey);
    console.log('Ссылка для ввода данных карты:', cardRequest.PaymentURL);

    // Получаем список карт клиента
    const cardList = await tbank.getCardList({
      CustomerKey: customerKey,
    });

    console.log('Количество карт:', cardList.Cards ? cardList.Cards.length : 0);

    return cardRequest;
  } catch (error) {
    console.error('Ошибка управления картами:', error.message);
  }
}

// Пример 6: QR-код для платежа
async function createQRPayment() {
  try {
    console.log('\n=== QR-код для платежа ===');

    // Создаем платеж
    const payment = await tbank.initPayment({
      Amount: TbankPayments.amountToKopecks(50),
      OrderId: `qr-order-${Date.now()}`,
      Description: 'QR-платеж',
    });

    // Получаем QR-код
    const qr = await tbank.getQr({
      PaymentId: payment.PaymentId,
      DataType: 'PAYLOAD',
    });

    console.log('QR-код создан для платежа:', payment.PaymentId);
    console.log('QR-данные:', qr.Data);

    return { payment, qr };
  } catch (error) {
    console.error('Ошибка создания QR-платежа:', error.message);
  }
}

// Пример 7: Проверка подписи webhook
function verifyWebhookExample() {
  console.log('\n=== Проверка подписи webhook ===');

  // Пример данных webhook
  const webhookData = {
    TerminalKey: 'YOUR_TERMINAL_KEY',
    PaymentId: 12345,
    Status: 'CONFIRMED',
    Amount: 10000,
    OrderId: 'test-order',
  };

  // Генерируем правильную подпись
  const correctToken = tbank.generateToken(webhookData);
  console.log('Правильная подпись:', correctToken);

  // Проверяем подпись
  const isValid = tbank.verifyNotificationSignature(webhookData, correctToken);
  console.log('Подпись валидна:', isValid);

  // Проверяем неправильную подпись
  const isInvalid = tbank.verifyNotificationSignature(webhookData, 'wrong-token');
  console.log('Неправильная подпись валидна:', isInvalid);
}

// Запуск примеров
async function runExamples() {
  console.log('🚀 Запуск примеров T-Bank Payments\n');

  // Пример проверки подписи (не требует API)
  verifyWebhookExample();

  // Если у вас есть тестовые ключи, раскомментируйте:
  /*
  const payment1 = await createSimplePayment();
  const payment2 = await createPaymentWithReceipt();
  
  if (payment1) {
    await checkPaymentStatus(payment1.PaymentId);
  }
  
  const customerKey = await manageCustomer();
  if (customerKey) {
    await manageCards(customerKey);
  }
  
  await createQRPayment();
  */

  console.log('\n✅ Примеры завершены');
}

// Запускаем примеры
if (require.main === module) {
  runExamples().catch(console.error);
}

module.exports = {
  createSimplePayment,
  createPaymentWithReceipt,
  checkPaymentStatus,
  manageCustomer,
  manageCards,
  createQRPayment,
  verifyWebhookExample,
};
