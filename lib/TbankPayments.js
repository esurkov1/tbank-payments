const HttpClient = require('./core/client');
const { generateToken } = require('./core/token');
const { validate } = require('./core/validator');
const { amountToKopecks, kopecksToAmount, createReceipt } = require('./utils/helpers');

// Импорт модулей
const paymentInitiation = require('./modules/payment-initiation');
const cardPayments = require('./modules/card-payments');
const threeDS = require('./modules/card-payments/3ds');
const paymentCancellation = require('./modules/payment-cancellation');
const paymentStatus = require('./modules/payment-status');
const operationReference = require('./modules/operation-reference');
const savedPayments = require('./modules/saved-payments');
const receipts = require('./modules/receipts');
const sbp = require('./modules/alternative-payments/sbp');
const tpay = require('./modules/alternative-payments/tpay');
const sberpay = require('./modules/alternative-payments/sberpay');
const mirpay = require('./modules/alternative-payments/mirpay');
const customers = require('./modules/card-binding/customers');
const cards = require('./modules/card-binding/cards');

/**
 * T-Bank Payments API Client
 * Полная реализация API T-Bank для приема платежей
 *
 * @see https://developer.tbank.ru/eacq/api
 */
class TbankPayments {
  constructor({
    merchantId,
    secret,
    apiUrl = 'https://securepay.tinkoff.ru',
    logger = console,
    retryConfig = {},
  }) {
    if (!merchantId || !secret) {
      throw new Error('merchantId и secret обязательны для инициализации');
    }

    this.merchantId = merchantId;
    this.secret = secret;
    this.apiUrl = apiUrl.replace(/\/$/, ''); // убираем trailing slash для обратной совместимости
    this.logger = logger;

    // Создаем context для модулей
    this.context = {
      config: { merchantId, secret, apiUrl },
      client: new HttpClient({
        apiUrl,
        merchantId,
        secret,
        tokenGenerator: generateToken,
        logger,
        retryConfig,
      }),
      validator: { validate },
      tokenGenerator: generateToken,
    };

    // Делегируем методы из модулей
    this._bindModuleMethods();
  }

  /**
   * Привязка методов из модулей к экземпляру класса
   */
  _bindModuleMethods() {
    // Проведение платежа
    this.initPayment = (params) => paymentInitiation.initPayment(this.context, params);
    this.confirmPayment = (params) => paymentInitiation.confirmPayment(this.context, params);
    this.confirmDebit = (params) => paymentInitiation.confirmDebit(this.context, params);

    // Прием платежей по карте
    this.finishAuthorize = (params) => cardPayments.finishAuthorize(this.context, params);

    // Методы для работы с 3DS
    this.check3dsVersion = (params) => threeDS.check3dsVersion(this.context, params);
    this.submit3DSMethod = (params) => threeDS.submit3DSMethod(this.context, params);
    this.submit3DSAuthorization = (params) => threeDS.submit3DSAuthorization(this.context, params);
    this.confirm3DSv1 = (params) => threeDS.confirm3DSv1(this.context, params);
    this.confirm3DSv2 = (params) => threeDS.confirm3DSv2(this.context, params);

    // Отмена платежа
    this.cancelPayment = (params) => paymentCancellation.cancelPayment(this.context, params);

    // Статус платежа или заказа
    this.getPaymentState = (params) => paymentStatus.getPaymentState(this.context, params);
    this.checkOrder = (params) => paymentStatus.checkOrder(this.context, params);

    // Справка по операции
    this.getConfirmOperation = (params) =>
      operationReference.getConfirmOperation(this.context, params);

    // Платежи по сохраненным реквизитам
    this.chargeRecurrent = (params) => savedPayments.chargeRecurrent(this.context, params);
    this.chargeQr = (params) => savedPayments.chargeQr(this.context, params);

    // Методы работы с чеками
    this.sendClosingReceipt = (params) => receipts.sendClosingReceipt(this.context, params);
    this.getReceiptState = (params) => receipts.getReceiptState(this.context, params);

    // СБП
    this.getQr = (params) => sbp.getQr(this.context, params);
    this.getQrState = (params) => sbp.getQrState(this.context, params);
    this.getQrBankList = (params) => sbp.getQrBankList(this.context, params);
    this.addAccount = (params) => sbp.addAccount(this.context, params);
    this.getAddAccountState = (params) => sbp.getAddAccountState(this.context, params);
    this.getAccountQrList = (params) => sbp.getAccountQrList(this.context, params);
    this.sbpPayTest = (params) => sbp.sbpPayTest(this.context, params);
    this.getQrMembersList = (params) => sbp.getQrMembersList(this.context, params);

    // T-Pay
    this.getTPayStatus = () => tpay.getTPayStatus(this.context);
    this.getTPayLink = (params) => tpay.getTPayLink(this.context, params);
    this.getTPayQr = (params) => tpay.getTPayQr(this.context, params);

    // SberPay
    this.getSberPayQr = (params) => sberpay.getSberPayQr(this.context, params);
    this.getSberPayLink = (params) => sberpay.getSberPayLink(this.context, params);

    // Mir Pay
    this.getMirPayDeepLink = (params) => mirpay.getMirPayDeepLink(this.context, params);

    // Методы работы с клиентами
    this.addCustomer = (params) => customers.addCustomer(this.context, params);
    this.getCustomer = (params) => customers.getCustomer(this.context, params);
    this.removeCustomer = (params) => customers.removeCustomer(this.context, params);

    // Методы работы с картами
    this.addCard = (params) => cards.addCard(this.context, params);
    this.attachCard = (params) => cards.attachCard(this.context, params);
    this.getAddCardState = (params) => cards.getAddCardState(this.context, params);
    this.getCardList = (params) => cards.getCardList(this.context, params);
    this.removeCard = (params) => cards.removeCard(this.context, params);
    this.submitRandomAmount = (params) => cards.submitRandomAmount(this.context, params);
  }

  /**
   * Генерация токена по алгоритму T-Bank API
   * @param {Object} params - Параметры запроса
   * @returns {string} SHA-256 хеш токена
   */
  generateToken(params) {
    return generateToken(params, this.secret);
  }

  /**
   * Проверка подписи уведомления
   * @param {Object} notification - Уведомление от T-Bank
   * @param {string} receivedToken - Полученный токен
   * @returns {boolean} true если подпись верна
   */
  verifyNotificationSignature(notification, receivedToken) {
    const calculatedToken = this.generateToken(notification);
    return calculatedToken === receivedToken;
  }

  /**
   * Создание чека для платежа
   * @param {Object} params - Параметры чека
   * @returns {Object} Объект чека
   */
  createReceipt(params) {
    return createReceipt(params); // eslint-disable-line class-methods-use-this
  }

  /**
   * Форматирование суммы в копейки
   * @param {number} rubles - Сумма в рублях
   * @returns {number} Сумма в копейках
   */
  static amountToKopecks(rubles) {
    return amountToKopecks(rubles);
  }

  /**
   * Форматирование суммы из копеек в рубли
   * @param {number} kopecks - Сумма в копейках
   * @returns {number} Сумма в рублях
   */
  static kopecksToAmount(kopecks) {
    return kopecksToAmount(kopecks);
  }
}

module.exports = TbankPayments;
