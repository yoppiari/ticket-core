'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MarketplaceEvent {
    id: string;
    name: string;
    slug: string;
    tenant_name: string;
    tenant_slug: string;
    start_date: string;
    venue_name: string;
    commission_display: string;
    event_url: string;
}

export default function AffiliateMarketplacePage() {
    const router = useRouter();
    const [events, setEvents] = useState<MarketplaceEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchMarketplace();
    }, []);

    const fetchMarketplace = async () => {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${baseUrl}/api/affiliates/marketplace`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to load marketplace');

            const data = await res.json();
            setEvents(data.data || []);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = (event: MarketplaceEvent) => {
        fetchAffiliateCode().then(code => {
            if (!code) {
                alert("You need to register as an affiliate first!");
                return;
            }

            const link = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/${event.tenant_slug}/e/${event.slug}?ref=${code}`;
            navigator.clipboard.writeText(link);
            setCopiedId(event.id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const fetchAffiliateCode = async () => {
        const token = localStorage.getItem('auth_token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${baseUrl}/api/affiliates/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data[0].referral_code;
                }
            }
        } catch (e) { console.error(e); }
        return null;
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading marketplace...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Affiliate Marketplace</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Promote these events and earn commissions.</p>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <div key={event.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                    {event.tenant_name}
                                </span>
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 border border-green-200 dark:border-green-800">
                                    Earn {event.commission_display}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 dark:text-white" title={event.name}>
                                {event.name}
                            </h3>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 space-y-1">
                                <p>📅 {new Date(event.start_date).toLocaleDateString()}</p>
                                <p>📍 {event.venue_name}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/50">
                            <button
                                onClick={() => handleCopyLink(event)}
                                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${copiedId === event.id
                                    ? 'bg-green-600 text-white shadow-inner'
                                    : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-gray-100 shadow-sm'
                                    }`}
                            >
                                {copiedId === event.id ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                ))}

                {events.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-dashed border-gray-300 dark:border-zinc-800">
                        No events found in the marketplace. Check back later!
                    </div>
                )}
            </div>
        </div>
    );
}
