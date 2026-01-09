"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Define Types
type WithdrawalRequest = {
    id: string;
    amount: number;
    bank_name: string;
    account_number: string;
    status: 'pending_approval' | 'approved' | 'rejected';
    created_at: string;
    tenant: {
        id: string;
        name: string;
    }
};

export default function SystemFinancePage() {
    const router = useRouter();
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Mock Data for MVP visualization if API is empty
    // In real implementation, this comes from API
    useEffect(() => {
        // Ideally fetch from /api/admin/withdrawals/pending
        // But we need to implement that endpoint first, or mock it here.
        // Let's mock it for now to show the UI as requested.
        const mockData: WithdrawalRequest[] = [
            {
                id: "wd_123",
                amount: 15000000,
                bank_name: "BCA",
                account_number: "888111222",
                status: "pending_approval",
                created_at: new Date().toISOString(),
                tenant: { id: "t_1", name: "Big Concerts Inc." }
            },
            {
                id: "wd_124",
                amount: 25000000,
                bank_name: "Mandiri",
                account_number: "11223344",
                status: "pending_approval",
                created_at: new Date().toISOString(),
                tenant: { id: "t_2", name: "Festival Mania" }
            }
        ];
        setRequests(mockData);
        setLoading(false);
    }, []);

    async function handleApprove(id: string) {
        if (!confirm("Confirm transfer of funds?")) return;
        setProcessingId(id);
        const token = localStorage.getItem("auth_token");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/withdrawals/${id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            });

            if (res.ok) {
                alert("Withdrawal approved!");
                setRequests(requests.filter(r => r.id !== id));
            } else {
                alert("Failed to approve");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    }

    async function handleReject(id: string) {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        setProcessingId(id);
        const token = localStorage.getItem("auth_token");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/withdrawals/${id}/reject`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({ reason })
            });

            if (res.ok) {
                alert("Withdrawal rejected and refunded.");
                setRequests(requests.filter(r => r.id !== id));
            } else {
                alert("Failed to reject");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setProcessingId(null);
        }
    }

    if (loading) return <div>Loading requests...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">Withdrawal Approvals</h1>

            {requests.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-zinc-950 rounded-xl border dark:border-zinc-800 text-zinc-500">
                    No pending requests.
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-lg">{req.tenant.name}</span>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase rounded">Pending Approval</span>
                                </div>
                                <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(req.amount)}
                                </div>
                                <div className="text-sm text-zinc-500 font-mono">
                                    {req.bank_name} - {req.account_number}
                                </div>
                                <div className="text-xs text-zinc-400 mt-1">
                                    Requested: {new Date(req.created_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleReject(req.id)}
                                    disabled={processingId === req.id}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(req.id)}
                                    disabled={processingId === req.id}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition shadow disabled:opacity-50"
                                >
                                    {processingId === req.id ? "Processing..." : "Approve & Transfer"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
