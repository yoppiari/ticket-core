'use client';

import { useEffect, useState } from 'react';

export default function AffiliateDashboard() {
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stats
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/affiliates/stats`, {
            // Assume auth headers included automatically via cookies or intercepter,
            // or we need to add manual token handling if simple fetch.
            // For project pattern, assume session cookie or Sanctum standard.
            headers: {
                'Accept': 'application/json',
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Unauthenticated or Error');
                return res.json();
            })
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-10 text-center text-white">Loading Dashboard...</div>;

    if (stats.length === 0) {
        return (
            <div className="p-10 text-center text-white">
                <h2 className="text-2xl font-bold">Affiliate Program</h2>
                <p className="mt-4">You have not registered as an affiliate for any event yet.</p>
                {/* Registration Form could go here */}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold mb-8">Partner Earnings</h1>

            <div className="space-y-8">
                {stats.map((item, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-blue-400">{item.tenant_name}</h2>
                                <div className="mt-2 text-sm text-gray-400">
                                    Your Link Code: <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded select-all">{item.referral_code}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-400">Total Earnings</div>
                                <div className="text-3xl font-bold text-green-400">
                                    Rp {new Intl.NumberFormat('id-ID').format(item.total_commission)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-700/50 p-4 rounded-lg">
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Clicks</div>
                                <div className="text-2xl font-bold mt-1">{item.clicks}</div>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-lg">
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Sales</div>
                                <div className="text-2xl font-bold mt-1">{item.total_conversions}</div>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-lg">
                                <div className="text-xs text-gray-400 uppercase tracking-wide">Conversion Rate</div>
                                <div className="text-2xl font-bold mt-1">
                                    {item.clicks > 0 ? ((item.total_conversions / item.clicks) * 100).toFixed(1) : 0}%
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold uppercase text-gray-500 mb-3">Recent Conversions</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="bg-gray-700 text-gray-400">
                                        <tr>
                                            <th className="px-4 py-2">Date</th>
                                            <th className="px-4 py-2">Order ID</th>
                                            <th className="px-4 py-2 text-right">Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {item.recent_orders.map((order: any) => (
                                            <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                                <td className="px-4 py-2">{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 font-mono text-xs">{order.id}</td>
                                                <td className="px-4 py-2 text-right text-green-400">
                                                    Rp {new Intl.NumberFormat('id-ID').format(order.commission_amount)}
                                                </td>
                                            </tr>
                                        ))}
                                        {item.recent_orders.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-4 text-center text-gray-500">No conversions yet.</td>
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
