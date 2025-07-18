const TbankPayments = require('./index');

// Mock axios для тестирования
jest.mock('axios');
const axios = require('axios');

describe('TbankPayments', () => {
  let tbank;
  const mockLogger = {
    debug: jest.fn(),
    error: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    tbank = new TbankPayments({
      merchantId: 'TEST_TERMINAL',
      secret: 'TEST_SECRET',
      logger: mockLogger
    });
  });

  describe('Constructor', () => {
    test('should initialize with required parameters', () => {
      expect(tbank.merchantId).toBe('TEST_TERMINAL');
      expect(tbank.secret).toBe('TEST_SECRET');
      expect(tbank.apiUrl).toBe('https://securepay.tinkoff.ru');
    });

    test('should throw error if merchantId is missing', () => {
      expect(() => {
        new TbankPayments({ secret: 'TEST_SECRET' });
      }).toThrow('merchantId и secret обязательны для инициализации');
    });

    test('should throw error if secret is missing', () => {
      expect(() => {
        new TbankPayments({ merchantId: 'TEST_TERMINAL' });
      }).toThrow('merchantId и secret обязательны для инициализации');
    });

    test('should use custom apiUrl', () => {
      const customTbank = new TbankPayments({
        merchantId: 'TEST_TERMINAL',
        secret: 'TEST_SECRET',
        apiUrl: 'https://custom.api.url/'
      });
      
      expect(customTbank.apiUrl).toBe('https://custom.api.url');
    });
  });

  describe('Token generation', () => {
    test('should generate correct token', () => {
      const params = {
        TerminalKey: 'TEST_TERMINAL',
        Amount: 10000,
        OrderId: 'order-123'
      };

      const token = tbank.generateToken(params);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // SHA-256 hex length
    });

    test('should exclude complex objects from token generation', () => {
      const params = {
        TerminalKey: 'TEST_TERMINAL',
        Amount: 10000,
        OrderId: 'order-123',
        Receipt: { Email: 'test@test.com' }, // Should be excluded
        DATA: { custom: 'data' }, // Should be excluded
        Token: 'existing-token' // Should be excluded
      };

      const token = tbank.generateToken(params);
      expect(token).toBeDefined();
    });

    test('should generate same token for same parameters', () => {
      const params = {
        TerminalKey: 'TEST_TERMINAL',
        Amount: 10000,
        OrderId: 'order-123'
      };

      const token1 = tbank.generateToken(params);
      const token2 = tbank.generateToken(params);
      
      expect(token1).toBe(token2);
    });
  });

  describe('API requests', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({
        data: { Success: true, PaymentId: 12345 }
      });
    });

    test('should make request with auto-generated token', async () => {
      const result = await tbank.initPayment({
        Amount: 10000,
        OrderId: 'order-123'
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://securepay.tinkoff.ru/v2/Init',
        expect.objectContaining({
          TerminalKey: 'TEST_TERMINAL',
          Amount: 10000,
          OrderId: 'order-123',
          Token: expect.any(String)
        }),
        expect.any(Object)
      );

      expect(result.Success).toBe(true);
      expect(result.PaymentId).toBe(12345);
    });

    test('should handle API errors', async () => {
      axios.post.mockResolvedValue({
        data: { 
          Success: false, 
          ErrorCode: 'INVALID_REQUEST',
          Message: 'Invalid amount',
          Details: 'Amount must be positive'
        }
      });

      await expect(tbank.initPayment({
        Amount: 10000,
        OrderId: 'order-123'
      })).rejects.toThrow('Invalid amount');
    });

    test('should handle network errors', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      await expect(tbank.initPayment({
        Amount: 10000,
        OrderId: 'order-123'
      })).rejects.toThrow('Network error');
    });
  });

  describe('Payment methods', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({
        data: { Success: true }
      });
    });

    test('initPayment should validate required parameters', async () => {
      await expect(tbank.initPayment({})).rejects.toThrow('Ошибка валидации');
      
      await expect(tbank.initPayment({
        Amount: 'invalid'
      })).rejects.toThrow('Ошибка валидации');
    });

    test('confirmPayment should work correctly', async () => {
      await tbank.confirmPayment({
        PaymentId: 12345,
        Amount: 10000
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://securepay.tinkoff.ru/v2/Confirm',
        expect.objectContaining({
          PaymentId: 12345,
          Amount: 10000
        }),
        expect.any(Object)
      );
    });

    test('cancelPayment should work correctly', async () => {
      await tbank.cancelPayment({
        PaymentId: 12345
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://securepay.tinkoff.ru/v2/Cancel',
        expect.objectContaining({
          PaymentId: 12345
        }),
        expect.any(Object)
      );
    });

    test('getPaymentState should work correctly', async () => {
      await tbank.getPaymentState({
        PaymentId: 12345
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://securepay.tinkoff.ru/v2/GetState',
        expect.objectContaining({
          PaymentId: 12345
        }),
        expect.any(Object)
      );
    });
  });

  describe('Customer management', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({
        data: { Success: true }
      });
    });

    test('addCustomer should validate email', async () => {
      await expect(tbank.addCustomer({
        CustomerKey: 'customer-123',
        Email: 'invalid-email'
      })).rejects.toThrow('Ошибка валидации');
    });

    test('addCustomer should work with valid data', async () => {
      await tbank.addCustomer({
        CustomerKey: 'customer-123',
        Email: 'test@example.com',
        Phone: '+79001234567'
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://securepay.tinkoff.ru/v2/AddCustomer',
        expect.objectContaining({
          CustomerKey: 'customer-123',
          Email: 'test@example.com',
          Phone: '+79001234567'
        }),
        expect.any(Object)
      );
    });
  });

  describe('Card management', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({
        data: { Success: true }
      });
    });

    test('addCard should validate CheckType', async () => {
      await expect(tbank.addCard({
        CustomerKey: 'customer-123',
        CheckType: 'INVALID'
      })).rejects.toThrow('Ошибка валидации');
    });

    test('addCard should work with valid CheckType', async () => {
      await tbank.addCard({
        CustomerKey: 'customer-123',
        CheckType: '3DS'
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://securepay.tinkoff.ru/v2/AddCard',
        expect.objectContaining({
          CustomerKey: 'customer-123',
          CheckType: '3DS'
        }),
        expect.any(Object)
      );
    });
  });

  describe('QR and SBP methods', () => {
    beforeEach(() => {
      axios.post.mockResolvedValue({
        data: { Success: true }
      });
    });

    test('getQr should validate DataType', async () => {
      await expect(tbank.getQr({
        PaymentId: 12345,
        DataType: 'INVALID'
      })).rejects.toThrow('Ошибка валидации');
    });

    test('getQr should work with valid DataType', async () => {
      await tbank.getQr({
        PaymentId: 12345,
        DataType: 'PAYLOAD'
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://securepay.tinkoff.ru/v2/GetQr',
        expect.objectContaining({
          PaymentId: 12345,
          DataType: 'PAYLOAD'
        }),
        expect.any(Object)
      );
    });
  });

  describe('Helper methods', () => {
    test('verifyNotificationSignature should work correctly', () => {
      const notification = {
        TerminalKey: 'TEST_TERMINAL',
        PaymentId: 12345,
        Status: 'CONFIRMED',
        Amount: 10000
      };

      const token = tbank.generateToken(notification);
      const isValid = tbank.verifyNotificationSignature(notification, token);
      
      expect(isValid).toBe(true);
      
      const isInvalid = tbank.verifyNotificationSignature(notification, 'wrong-token');
      expect(isInvalid).toBe(false);
    });

    test('createReceipt should format items correctly', () => {
      const receipt = tbank.createReceipt({
        email: 'test@example.com',
        phone: '+79001234567',
        taxation: 'osn',
        items: [
          {
            name: 'Product 1',
            price: 10000,
            quantity: 2,
            tax: 'vat20'
          }
        ]
      });

      expect(receipt).toEqual({
        Email: 'test@example.com',
        Phone: '+79001234567',
        Taxation: 'osn',
        Items: [
          {
            Name: 'Product 1',
            Price: 10000,
            Quantity: 2,
            Amount: 20000,
            Tax: 'vat20',
            Ean13: undefined
          }
        ]
      });
    });

    test('amountToKopecks should convert correctly', () => {
      expect(TbankPayments.amountToKopecks(100)).toBe(10000);
      expect(TbankPayments.amountToKopecks(99.99)).toBe(9999);
      expect(TbankPayments.amountToKopecks(0.01)).toBe(1);
    });

    test('kopecksToAmount should convert correctly', () => {
      expect(TbankPayments.kopecksToAmount(10000)).toBe(100);
      expect(TbankPayments.kopecksToAmount(9999)).toBe(99.99);
      expect(TbankPayments.kopecksToAmount(1)).toBe(0.01);
    });
  });

  describe('Validation', () => {
    test('should validate IP addresses', async () => {
      await expect(tbank.confirmPayment({
        PaymentId: 12345,
        IP: 'invalid-ip'
      })).rejects.toThrow('Ошибка валидации');

      // Should not throw for valid IP
      await expect(tbank.confirmPayment({
        PaymentId: 12345,
        IP: '192.168.1.1'
      })).resolves.toBeDefined();
    });

    test('should validate email addresses', async () => {
      await expect(tbank.addCustomer({
        CustomerKey: 'customer-123',
        Email: 'invalid-email'
      })).rejects.toThrow('Ошибка валидации');

      // Should not throw for valid email
      await expect(tbank.addCustomer({
        CustomerKey: 'customer-123',
        Email: 'test@example.com'
      })).resolves.toBeDefined();
    });

    test('should validate URLs', async () => {
      await expect(tbank.initPayment({
        Amount: 10000,
        OrderId: 'order-123',
        SuccessURL: 'invalid-url'
      })).rejects.toThrow('Ошибка валидации');

      // Should not throw for valid URL
      await expect(tbank.initPayment({
        Amount: 10000,
        OrderId: 'order-123',
        SuccessURL: 'https://example.com/success'
      })).resolves.toBeDefined();
    });
  });
}); 