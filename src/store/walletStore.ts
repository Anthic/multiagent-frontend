import { create } from 'zustand';
import { IWalletBalance, walletService } from '../services/walletService';

interface WalletState {
  balanceBDT: number;
  freeDailyResearchUsed: number;
  freeDailyLimit: number;
  canUseFreeSearch: boolean;
  isLoading: boolean;
  isTopUpModalOpen: boolean;
  requiredAmountBDT: number;
  modalMessage: string;

  // Actions
  openTopUpModal: (requiredAmount?: number, message?: string) => void;
  closeTopUpModal: () => void;
  fetchWalletBalance: () => Promise<void>;
  setWalletData: (data: Partial<IWalletBalance>) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balanceBDT: 0,
  freeDailyResearchUsed: 0,
  freeDailyLimit: 1,
  canUseFreeSearch: true,
  isLoading: false,
  isTopUpModalOpen: false,
  requiredAmountBDT: 10,
  modalMessage: 'Daily free research limit reached. Please top up your wallet with ৳10 BDT to continue.',

  openTopUpModal: (requiredAmount = 10, message = 'Please top up your wallet to continue.') =>
    set({
      isTopUpModalOpen: true,
      requiredAmountBDT: requiredAmount,
      modalMessage: message,
    }),

  closeTopUpModal: () => set({ isTopUpModalOpen: false }),

  fetchWalletBalance: async () => {
    try {
      set({ isLoading: true });
      const data = await walletService.getBalance();
      set({
        balanceBDT: data.balanceBDT,
        freeDailyResearchUsed: data.freeDailyResearchUsed,
        freeDailyLimit: data.freeDailyLimit,
        canUseFreeSearch: data.canUseFreeSearch,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setWalletData: (data) => set((state) => ({ ...state, ...data })),
}));
