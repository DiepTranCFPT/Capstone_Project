import React, { useEffect, useMemo, useState } from 'react';
import { Spin, Empty } from 'antd';
import { FiArrowUpRight, FiClock, FiArrowRight } from 'react-icons/fi';
import TokenTransactionService from '~/services/tokenTransactionService';
import type { UserTokenTransaction } from '~/types/tokenTransaction';

type RecentTokenTransactionsProps = {
    pageSize?: number;
    title?: string;
    viewAllLabel?: string;
    description?: string;
};

const RecentTokenTransactions: React.FC<RecentTokenTransactionsProps> = ({
    pageSize = 5,
    title = "Transaction History",
    viewAllLabel = "View All",
    description = "Recent withdrawals and payments",
}) => {
    const [transactions, setTransactions] = useState<UserTokenTransaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const res = await TokenTransactionService.getUserTokenTransactions();
                const data = Array.isArray(res.data?.data) ? res.data.data : [];
                const sorted = [...data].sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return bTime - aTime;
                });
                setTransactions(sorted);
            } catch (error) {
                console.error("Failed to fetch token transactions", error);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const items = useMemo(() => {
        const sorted = [...transactions].sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });
        return pageSize > 0 ? sorted.slice(0, pageSize) : sorted;
    }, [transactions, pageSize]);

    const formatAmount = (val?: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(val ?? 0);

    const formatDate = (val?: string) =>
        val ? new Date(val).toLocaleString() : "N/A";

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 mt-8">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-400">{description}</p>
                </div>
                <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                    {viewAllLabel}
                    <FiArrowRight />
                </button>
            </div>
            {loading ? (
                <div className="flex justify-center py-10">
                    <Spin />
                </div>
            ) : items.length === 0 ? (
                <div className="py-10">
                    <Empty description="No transactions" />
                </div>
            ) : (
                <div className="divide-y divide-slate-100 mt-4">
                    {items.map((item) => {
                        const status = item.status || "Pending";
                        const isSuccess = status.toLowerCase().includes("success");
                        return (
                            <div
                                key={item.id || `${item.createdAt}-${item.amount}`}
                                className="flex flex-wrap items-center gap-4 py-4"
                            >
                                <div className="flex flex-1 items-center gap-4 min-w-0">
                                    <span className="rounded-2xl p-3 bg-emerald-50 text-emerald-600 shrink-0">
                                        <FiArrowUpRight />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-800 truncate">
                                            {item.description || "N/A"}
                                        </p>
                                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                            <FiClock />
                                            {formatDate(item.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-lg font-bold text-emerald-600">
                                        {formatAmount(item.amount)}
                                    </p>
                                    {isSuccess && (
                                        <p className="text-xs text-slate-400 mt-1">
                                            Balance after: {item.balanceAfter != null && typeof item.balanceAfter === "number" 
                                                ? formatAmount(item.balanceAfter) 
                                                : "N/A"}
                                        </p>
                                    )}
                                    <p
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold mt-1 ${
                                            isSuccess
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-amber-50 text-amber-600"
                                        }`}
                                    >
                                        {status}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RecentTokenTransactions;

