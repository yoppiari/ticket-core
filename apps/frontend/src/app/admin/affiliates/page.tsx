'use client';

import { useEffect, useState } from 'react';

export default function TenantAffiliatesPage() {
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchAffiliates = async (pageNum: number) => {
        setLoading(true);
        // Use correct auth key
        const token = localStorage.getItem('auth_token');

        if (!token) {
            // Should redirect if not handled by parent or middleware, but safe to check
            setLoading(false);
            return;
        }

        try {
            // Correct URL construction including /api prefix fallback
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${baseUrl}/api/admin/affiliates?page=${pageNum}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
                return;
            }

            if (!res.ok) {
                throw new Error(`Failed to load affiliates: ${res.statusText}`);
            }

            const data = await res.json();

            if (data.data) {
                setAffiliates(data.data);
                setTotalPages(data.last_page);
                setPage(data.current_page);
            } else {
                setAffiliates([]);
            }
        } catch (err) {
            console.error("Error fetching affiliates:", err);
            // Optionally set error state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAffiliates(1);
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Affiliate Management</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Your Affiliates</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Affiliate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Clicks</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sales</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Earned</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : affiliates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No affiliates found.</td>
                                </tr>
                            ) : (
                                affiliates.map((aff) => (
                                    <tr key={aff.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{aff.name}</div>
                                            <div className="text-sm text-gray-500">{aff.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {aff.referral_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">
                                            {aff.clicks}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-300">
                                            {aff.total_conversions}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-bold">
                                            Rp {new Intl.NumberFormat('id-ID').format(aff.total_commission)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(aff.joined_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
                        <div className="flex-1 flex justify-between">
                            <button
                                onClick={() => fetchAffiliates(page - 1)}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchAffiliates(page + 1)}
                                disabled={page === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
