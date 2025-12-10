import React from "react";
import { Button, Card } from "antd";
import { PlusOutlined, SwapOutlined } from "@ant-design/icons";

interface ParentWalletBalanceCardProps {
  balance: number | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onTopUp: () => void;
  onTransfer: () => void;
  topupLoading?: boolean;
  transferLoading?: boolean;
  transferDisabled?: boolean;
}

const ParentWalletBalanceCard: React.FC<ParentWalletBalanceCardProps> = ({
  balance,
  loading,
  error,
  onRefresh,
  onTopUp,
  onTransfer,
  topupLoading,
  transferLoading,
  transferDisabled,
}) => {
  return (
    <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-xl border-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm opacity-80">Total available balance</p>
          <h2 className="text-3xl font-bold mt-2 drop-shadow-sm">
            {loading ? "Loading..." : (balance ?? 0).toLocaleString("vi-VN")} VND
          </h2>
          <p className="text-xs mt-1 text-indigo-100">
            Real-time update • Secure {error ? "• Cannot fetch balance" : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="default"
            ghost
            className="border-0 text-white hover:!text-white hover:!bg-white/10"
            loading={loading}
            onClick={onRefresh}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-white text-indigo-700 border-0 font-semibold px-5 shadow-md hover:!text-indigo-800"
            loading={topupLoading}
            onClick={onTopUp}
          >
            Top up
          </Button>
          <Button
            icon={<SwapOutlined />}
            className="bg-white text-indigo-700 border-0 font-semibold px-5 shadow-md hover:!text-indigo-800"
            loading={transferLoading}
            disabled={transferDisabled}
            onClick={onTransfer}
          >
            Transfer
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ParentWalletBalanceCard;

