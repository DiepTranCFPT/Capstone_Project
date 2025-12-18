import React from "react";
import { FaWallet } from "react-icons/fa";

interface TopStatusProps {
  formattedBalance: string;
}

const TopStatus: React.FC<TopStatusProps> = ({ formattedBalance }) => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="text-sm uppercase tracking-widest text-slate-400">Available Balance</p>
      <div className="mt-1 flex items-center gap-3">
        <span className="text-3xl font-bold text-slate-900">{formattedBalance}</span>
      </div>
    </div>
    <div className="flex items-center gap-3 rounded-full border border-slate-100 bg-white px-4 py-2 shadow-sm">
      <FaWallet className="text-teal-500" />
      <span className="text-sm font-semibold text-slate-600">AP Wallet</span>
    </div>
  </div>
);

export default TopStatus;

