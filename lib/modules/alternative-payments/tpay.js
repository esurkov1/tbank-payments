/**
 * Модуль для работы с T-Pay
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Определить возможность проведения платежа
   * @see https://developer.tbank.ru/eacq/api/status
   */
  async getTPayStatus(context) {
    const terminalKey = context.config.merchantId;
    return context.client.get(`/v2/TinkoffPay/terminals/${terminalKey}/status`);
  },

  /**
   * Получить ссылку
   * @see https://developer.tbank.ru/eacq/api/link
   */
  async getTPayLink(context, params) {
    const { paymentId, version = '2.0' } = params;
    if (!paymentId) {
      throw new Error('paymentId обязателен');
    }
    return context.client.get(`/v2/TinkoffPay/transactions/${paymentId}/versions/${version}/link`);
  },

  /**
   * Получить QR
   * @see https://developer.tbank.ru/eacq/api/qr
   */
  async getTPayQr(context, params) {
    const { paymentId } = params;
    if (!paymentId) {
      throw new Error('paymentId обязателен');
    }
    return context.client.get(`/v2/TinkoffPay/${paymentId}/QR`);
  },
};
