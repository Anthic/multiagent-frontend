'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWalletStore } from '@/src/store/walletStore';
import { walletService, ITokenAuditLog } from '@/src/services/walletService';

function WalletStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get('status');
  const transactionId = searchParams.get('transactionId') || searchParams.get('tran_id');
  const amount = searchParams.get('amount') || searchParams.get('amountBDT');

  const { balanceBDT, fetchWalletBalance, openTopUpModal } = useWalletStore();
  const [logs, setLogs] = useState<ITokenAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchWalletBalance();
    loadAuditLogs();
  }, [fetchWalletBalance]);

  const loadAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await walletService.getAuditLogs();
      setLogs(data);
    } catch {
      // Best effort
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* ── Status Banners (Success / Failed / Cancelled) ────────────────────────── */}
      {status === 'success' && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-emerald-950/40 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl shadow-lg shadow-emerald-500/20">
              ✓
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Payment Completed
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Recharge Successful!
              </h2>
              <p className="mt-1 text-sm text-zinc-300">
                ৳{amount || '100'} BDT has been credited to your AtlashAI wallet.
              </p>
              {transactionId && (
                <p className="mt-1 font-mono text-xs text-zinc-400">
                  Transaction ID: <span className="text-zinc-200">{transactionId}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/research"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-xs font-bold text-black hover:bg-emerald-300 active:scale-95 transition-all shadow-lg shadow-emerald-400/20"
              >
                Start Deep Research 🚀
              </Link>
            </div>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-950/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-rose-950/40 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-3xl shadow-lg shadow-rose-500/20">
              ✕
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-400">
                Transaction Failed
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Payment Declined or Cancelled
              </h2>
              <p className="mt-1 text-sm text-zinc-300">
                The gateway transaction could not be processed. No money was deducted from your account.
              </p>
              {transactionId && (
                <p className="mt-1 font-mono text-xs text-zinc-400">
                  Reference: <span className="text-zinc-200">{transactionId}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => openTopUpModal(100)}
                className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-3 text-xs font-bold text-white hover:bg-rose-400 active:scale-95 transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                Try Again 💳
              </button>
            </div>
          </div>
        </div>
      )}

      {status === 'cancelled' && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-amber-950/40 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-3xl shadow-lg shadow-amber-500/20">
              !
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400">
                Payment Cancelled
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Recharge Was Cancelled
              </h2>
              <p className="mt-1 text-sm text-zinc-300">
                You cancelled the checkout session before completing payment.
              </p>
            </div>
            <button
              onClick={() => openTopUpModal(100)}
              className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 text-xs font-bold text-black hover:bg-amber-300 active:scale-95 transition-all cursor-pointer"
            >
              Restart Top-Up
            </button>
          </div>
        </div>
      )}

      {/* ── Wallet Overview Card ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Available Balance</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-white">
              ৳{balanceBDT.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-emerald-400">BDT</span>
          </div>
          <button
            onClick={() => openTopUpModal(100)}
            className="mt-4 w-full rounded-xl bg-emerald-500/15 border border-emerald-500/30 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/25 active:scale-98 transition-all cursor-pointer"
          >
            + Top Up via bKash / Nagad
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Daily Free Research</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-white">1</span>
            <span className="text-xs text-zinc-400">Free search per day</span>
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            Subsequent deep researches cost <span className="font-semibold text-zinc-200">৳10.00 BDT</span> per job.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-wider text-zinc-400">Payment Security</p>
          <div className="mt-2 flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <span>🛡️ SSLCommerz Encrypted</span>
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            Accepts bKash, Nagad, Rocket, Upay & VISA/Mastercard with instant credit.
          </p>
        </div>
      </div>

      {/* ── Transaction Audit Logs ────────────────────────────────────── */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-zinc-200">Recent Usage & Token Audit History</h3>
          <button
            onClick={loadAuditLogs}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Refresh ↺
          </button>
        </div>

        {loadingLogs ? (
          <div className="py-8 text-center text-xs text-zinc-500">Loading audit history...</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No research transactions recorded yet. Run your first research!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Operation</th>
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Tokens</th>
                  <th className="py-2.5 px-3">Cost (BDT)</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-zinc-200">{log.operationType}</td>
                    <td className="py-3 px-3 text-zinc-400 max-w-xs truncate">{log.topic || '-'}</td>
                    <td className="py-3 px-3 font-mono">{log.totalTokens.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">৳{log.costBDT.toFixed(2)}</td>
                    <td className="py-3 px-3 text-zinc-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalletDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black pt-24 text-center text-zinc-500">Loading wallet...</div>}>
      <WalletStatusContent />
    </Suspense>
  );
}
