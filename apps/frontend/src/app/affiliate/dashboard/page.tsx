'use client';

import { useEffect, useState } from 'react';

export default function AffiliateDashboard() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Auth check handled by layout
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        // Fetch stats
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/affiliates/stats`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(async res => {
                if (res.status === 401) {
                    // Let layout handle/redirect, but safely handle here too
                    return;
                }
                if (!res.ok) {
                    console.error('Stats Fetch Error Status:', res.status);
                    const text = await res.text();
                    console.error('Stats Fetch Error Body:', text);
                    throw new Error(`Error fetching stats: ${res.status} ${text}`);
                }
                return res.json();
            })
            .then(data => {
                // Ensure data is array
                setStats(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading Dashboard...</div>;

    if (stats.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Affiliate Program</h2>
                <p className="mt-4">You have not registered as an affiliate for any event yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Partner Earnings</h1>

            <div className="space-y-8">
                {stats.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-zinc-700">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">{item.tenant_name}</h2>
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    Your Link Code:
                                    <span className="text-gray-800 dark:text-gray-200 font-mono bg-gray-100 dark:bg-zinc-900 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 select-all font-bold">
                                        {item.referral_code}
                                    </span>
                                </div>
                            </div>
                            <div className="md:text-right w-full md:w-auto">
                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Earnings</div>
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    Rp {new Intl.NumberFormat('id-ID').format(item.total_commission)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-100 dark:border-zinc-700">
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Clicks</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.clicks}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-100 dark:border-zinc-700">
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Sales</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{item.total_conversions}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-gray-100 dark:border-zinc-700">
                                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Conversion Rate</div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                    {item.clicks > 0 ? ((item.total_conversions / item.clicks) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-3 border-b border-gray-200 dark:border-zinc-700 pb-2">Recent Conversions</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                                    <thead className="text-gray-400 bg-gray-50 dark:bg-zinc-900/30">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Date</th>
                                            <th className="px-4 py-2 font-medium">Order ID</th>
                                            <th className="px-4 py-2 text-right font-medium">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                        {item.recent_orders.map((order: any) => (
                                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                                <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{order.id.substring(0, 8)}...</td>
                                                <td className="px-4 py-3 text-right text-green-600 dark:text-green-400 font-medium">
                                                    Rp {new Intl.NumberFormat('id-ID').format(order.commission_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                        {item.recent_orders.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-6 text-center text-gray-400 italic">No conversions yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
