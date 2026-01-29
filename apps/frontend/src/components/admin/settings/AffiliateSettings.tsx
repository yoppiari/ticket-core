'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink } from 'lucide-react';

interface Affiliate {
    id: string;
    name: string | null;
    email: string | null;
    referral_code: string;
    commission_rate: number;
    clicks: number;
    total_conversions: number;
    total_commission: number;
    joined_at: string;
    user?: {
        name: string;
        email: string;
    };
}

export default function AffiliateSettings() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const fetchAffiliates = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/affiliates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAffiliates(data.data || []);
            } else {
                throw new Error('Failed to fetch affiliates');
            }
        } catch (error) {
            console.error('Failed to fetch affiliates:', error);
            setError('Could not load affiliates list.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading affiliates...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b pb-6">
                <div>
                    <h2 className="text-xl font-bold">Affiliate Program</h2>
                    <p className="text-zinc-500 text-sm">Monitor your top performers and conversions.</p>
                </div>
                {/* <Button>Global Settings</Button> */}
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>}

            <div className="space-y-4">
                {affiliates.length > 0 ? (
                    <div className="bg-white dark:bg-zinc-950 border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs">Affiliate</th>
                                    <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs">Code</th>
                                    <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs text-right">Clicks</th>
                                    <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs text-right">Sales</th>
                                    <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-xs text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {affiliates.map((aff) => (
                                    <tr key={aff.id} className="hover:bg-zinc-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-zinc-900">{aff.user?.name || 'Unknown'}</div>
                                            <div className="text-zinc-500 text-xs">{aff.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className="font-mono bg-zinc-50">
                                                {aff.referral_code}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right tabular-nums">{aff.clicks}</td>
                                        <td className="px-6 py-4 text-right tabular-nums font-medium">{aff.total_conversions}</td>
                                        <td className="px-6 py-4 text-right tabular-nums font-bold text-green-600">
                                            {Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(aff.total_commission))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-zinc-50 rounded-xl border border-dashed text-zinc-500">
                        <p className="mb-2">No active affiliates yet.</p>
                        <p className="text-xs">Once users join your affiliate program, they will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
