/**
 * TypeScript типы для T-Bank Payments API Client
 * @see https://developer.tbank.ru/eacq/api
 */

export interface TbankPaymentsConfig {
  merchantId: string;
  secret: string;
  apiUrl?: string;
  logger?: {
    debug?: (message: string, data?: any) => void;
    error?: (message: string, data?: any) => void;
  };
  retryConfig?: {
    retries?: number;
    retryDelay?: (retryCount: number) => number;
    retryCondition?: (error: any) => boolean;
  };
}

export interface InitPaymentParams {
  Amount: number;
  OrderId: string;
  Description?: string;
  CustomerKey?: string;
  Recurrent?: 'Y';
  PayType?: 'O' | 'T';
  Language?: 'ru' | 'en';
  NotificationURL?: string;
  SuccessURL?: string;
  FailURL?: string;
  Receipt?: any;
  DATA?: any;
  RebillId?: string | number;
  OperationInitiatorType?: '2' | 'R' | 'I' | 'D' | 'N';
}

export interface InitPaymentResponse {
  Success: boolean;
  PaymentURL?: string;
  PaymentId: number;
  Status: string;
  RebillId?: string;
}

export interface ConfirmPaymentParams {
  PaymentId: string | number;
  Amount?: number;
  IP?: string;
  Receipt?: any;
}

export interface ConfirmPaymentResponse {
  Success: boolean;
  PaymentId: number;
  Status: string;
}

export interface CancelPaymentParams {
  PaymentId: string | number;
  Amount?: number;
  IP?: string;
  Receipt?: any;
}

export interface CancelPaymentResponse {
  Success: boolean;
  PaymentId: number;
  Status: string;
}

export interface GetPaymentStateParams {
  PaymentId: string | number;
  IP?: string;
}

export interface GetPaymentStateResponse {
  Success: boolean;
  PaymentId: number;
  Status: string;
  Amount: number;
}

export interface CheckOrderParams {
  OrderId: string;
}

export interface CheckOrderResponse {
  Success: boolean;
  OrderId: string;
  Payments: Array<{
    PaymentId: number;
    Status: string;
    Amount: number;
  }>;
}

declare class TbankPayments {
  constructor(config: TbankPaymentsConfig);

  // Проведение платежа
  initPayment(params: InitPaymentParams): Promise<InitPaymentResponse>;
  confirmPayment(params: ConfirmPaymentParams): Promise<ConfirmPaymentResponse>;
  confirmDebit(params: ConfirmPaymentParams): Promise<ConfirmPaymentResponse>;

  // Прием платежей по карте
  finishAuthorize(params: any): Promise<any>;

  // Методы для работы с 3DS
  check3dsVersion(params: any): Promise<any>;
  submit3DSMethod(params: any): Promise<any>;
  submit3DSAuthorization(params: any): Promise<any>;
  confirm3DSv1(params: any): Promise<any>;
  confirm3DSv2(params: any): Promise<any>;

  // Отмена платежа
  cancelPayment(params: CancelPaymentParams): Promise<CancelPaymentResponse>;

  // Статус платежа или заказа
  getPaymentState(params: GetPaymentStateParams): Promise<GetPaymentStateResponse>;
  checkOrder(params: CheckOrderParams): Promise<CheckOrderResponse>;

  // Справка по операции
  getConfirmOperation(params: any): Promise<any>;

  // Платежи по сохраненным реквизитам
  chargeRecurrent(params: any): Promise<any>;
  chargeQr(params: any): Promise<any>;

  // Методы работы с чеками
  sendClosingReceipt(params: any): Promise<any>;
  getReceiptState(params: any): Promise<any>;

  // СБП
  getQr(params: any): Promise<any>;
  getQrState(params: any): Promise<any>;
  getQrBankList(params?: any): Promise<any>;
  addAccount(params: any): Promise<any>;
  getAddAccountState(params: any): Promise<any>;
  getAccountQrList(params?: any): Promise<any>;
  sbpPayTest(params: any): Promise<any>;
  getQrMembersList(params?: any): Promise<any>;

  // T-Pay
  getTPayStatus(): Promise<any>;
  getTPayLink(params: { paymentId: number | string; version?: string }): Promise<any>;
  getTPayQr(params: { paymentId: number | string }): Promise<any>;

  // SberPay
  getSberPayQr(params: { paymentId: number | string }): Promise<any>;
  getSberPayLink(params: { paymentId: number | string; version?: string }): Promise<any>;

  // Mir Pay
  getMirPayDeepLink(params: any): Promise<any>;

  // Методы работы с клиентами
  addCustomer(params: any): Promise<any>;
  getCustomer(params: any): Promise<any>;
  removeCustomer(params: any): Promise<any>;

  // Методы работы с картами
  addCard(params: any): Promise<any>;
  attachCard(params: any): Promise<any>;
  getAddCardState(params: any): Promise<any>;
  getCardList(params: any): Promise<any>;
  removeCard(params: any): Promise<any>;
  submitRandomAmount(params: any): Promise<any>;

  // Вспомогательные методы
  generateToken(params: any): string;
  verifyNotificationSignature(notification: any, receivedToken: string): boolean;
  createReceipt(params: any): any;

  // Статические методы
  static amountToKopecks(rubles: number): number;
  static kopecksToAmount(kopecks: number): number;
}

export = TbankPayments;
