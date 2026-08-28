import { api } from '../lib/api';

export interface IWalletBalance {
  balanceBDT: number;
  totalSpentBDT: number;
  freeDailyResearchUsed: number;
  freeDailyLimit: number;
  canUseFreeSearch: boolean;
}

export interface ITokenAuditLog {
  id: string;
  operationType: string;
  topic?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costBDT: number;
  createdAt: string;
}

export interface IRechargeInitResponse {
  paymentUrl: string;
  transactionId: string;
  amountBDT: number;
}

export const walletService = {
  // Fetch current user wallet balance and free search status
  getBalance: async (): Promise<IWalletBalance> => {
    const response = await api.get<IWalletBalance>('/wallet/balance');
    return (response?.data || {
      balanceBDT: 0,
      totalSpentBDT: 0,
      freeDailyResearchUsed: 0,
      freeDailyLimit: 1,
      canUseFreeSearch: true,
    }) as IWalletBalance;
  },

  // Fetch token usage and transaction audit history
  getAuditLogs: async (): Promise<ITokenAuditLog[]> => {
    const response = await api.get<ITokenAuditLog[]>('/wallet/audit-logs');
    return (response?.data || []) as ITokenAuditLog[];
  },

  // Initialize bKash / Nagad / SSLCommerz payment recharge
  initRecharge: async (amountBDT: number, paymentType: string = 'wallet_topup'): Promise<IRechargeInitResponse> => {
    const response = await api.post<IRechargeInitResponse>('/payment/init-recharge', {
      amountBDT,
      paymentType,
    });
    return (response?.data || { paymentUrl: '', transactionId: '', amountBDT }) as IRechargeInitResponse;
  },
};
