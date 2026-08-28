'use client';

import React, { useState } from 'react';
import { useWalletStore } from '../../store/walletStore';
import { walletService } from '../../services/walletService';

const PRESET_AMOUNTS = [50, 100, 200, 500];

export const TopUpModal: React.FC = () => {
  const { isTopUpModalOpen, closeTopUpModal, modalMessage, balanceBDT } = useWalletStore();
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isTopUpModalOpen) return null;

  const currentAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handlePresetClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setError(null);
  };

  const handleRecharge = async () => {
    if (!currentAmount || currentAmount < 10) {
      setError('Minimum recharge amount is ৳10 BDT');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await walletService.initRecharge(currentAmount);
      if (res.paymentUrl) {
        // Redirect user to SSLCommerz bKash/Nagad/Cards gateway
        window.location.href = res.paymentUrl;
      } else {
        setError('Failed to generate payment gateway URL. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Payment initiation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeTopUpModal}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">
              ৳
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Top Up Wallet</h3>
              <p className="text-xs text-zinc-400">Current Balance: ৳{balanceBDT.toFixed(2)} BDT</p>
            </div>
          </div>
          <button
            onClick={closeTopUpModal}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Informative Notice (if opened via rate-limit) */}
        {modalMessage && (
          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
            ⚠️ {modalMessage}
          </div>
        )}

        {/* Preset Amount Grid */}
        <div className="mt-5">
          <label className="text-xs font-medium text-zinc-400">Select Package (BDT)</label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handlePresetClick(amt)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                  selectedAmount === amt && !customAmount
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/20'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                ৳{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="mt-4">
          <label className="text-xs font-medium text-zinc-400">Or Enter Custom Amount (BDT)</label>
          <div className="relative mt-1.5">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
              ৳
            </span>
            <input
              type="number"
              min="10"
              placeholder="e.g. 150"
              value={customAmount}
              onChange={handleCustomChange}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2.5 pl-8 pr-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Supported Payment Logos */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/30 px-3.5 py-2 text-xs text-zinc-400">
          <span>Supported Methods:</span>
          <span className="font-medium text-zinc-300">bKash • Nagad • Rocket • Cards</span>
        </div>

        {/* Error message */}
        {error && (
          <p className="mt-3 text-xs text-rose-400">{error}</p>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={closeTopUpModal}
            className="w-1/3 rounded-xl border border-zinc-800 py-2.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRecharge}
            disabled={isLoading}
            className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-black hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
          >
            {isLoading ? (
              <span>Redirecting...</span>
            ) : (
              <span>Pay ৳{currentAmount || 10} via bKash / Nagad</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
