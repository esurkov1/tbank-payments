/**
 * Вспомогательные функции
 */
module.exports = {
  /**
   * Форматирование суммы в копейки
   * @param {number} rubles - Сумма в рублях
   * @returns {number} Сумма в копейках
   */
  amountToKopecks(rubles) {
    return Math.round(rubles * 100);
  },

  /**
   * Форматирование суммы из копеек в рубли
   * @param {number} kopecks - Сумма в копейках
   * @returns {number} Сумма в рублях
   */
  kopecksToAmount(kopecks) {
    return kopecks / 100;
  },

  /**
   * Создание чека для платежа
   * @param {Object} params - Параметры чека
   * @param {string} params.email - Email покупателя
   * @param {string} [params.phone] - Телефон покупателя
   * @param {string} [params.taxation] - Система налогообложения (по умолчанию 'osn')
   * @param {Array} params.items - Массив позиций чека
   * @returns {Object} Объект чека
   */
  createReceipt({ email, phone, taxation = 'osn', items }) {
    const receipt = {
      Email: email,
      Taxation: taxation,
      Items: items.map((item) => ({
        Name: item.name,
        Price: item.price,
        Quantity: item.quantity || 1,
        Amount: item.amount || item.price * (item.quantity || 1),
        Tax: item.tax || 'none',
        Ean13: item.ean13,
      })),
    };

    if (phone) {
      receipt.Phone = phone;
    }

    return receipt;
  },
};
