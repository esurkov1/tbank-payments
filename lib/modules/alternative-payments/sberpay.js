/**
 * Модуль для работы с SberPay
 * @see https://developer.tbank.ru/eacq/api
 */
module.exports = {
  /**
   * Получить QR
   * @see https://developer.tbank.ru/eacq/api/sber-pay-qr
   */
  async getSberPayQr(context, params) {
    const { paymentId } = params;
    if (!paymentId) {
      throw new Error('paymentId обязателен');
    }
    return context.client.get(`/v2/SberPay/${paymentId}/QR`);
  },

  /**
   * Получить ссылку
   * @see https://developer.tbank.ru/eacq/api/sber-paylink
   */
  async getSberPayLink(context, params) {
    const { paymentId, version = '2.0' } = params;
    if (!paymentId) {
      throw new Error('paymentId обязателен');
    }
    return context.client.get(`/v2/SberPay/transactions/${paymentId}/versions/${version}/link`);
  },
};
