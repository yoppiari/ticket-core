'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardStats {
    events_count: number;
    total_sales: number;
    tickets_sold: number;
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Simple auth check
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }

        fetchStats(token);
    }, [router]);

    async function fetchStats(token: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (res.status === 401) {
                localStorage.removeItem('auth_token');
                router.push('/login');
                return;
            }

            if (!res.ok) throw new Error('Failed to load stats');

            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        router.push('/login');
    }



    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    // Layout is handled by /admin/layout.tsx
    // We just need the main content here.
    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Overview</h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-200">
                    Error loading dashboard: {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Events Card */}
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm flex flex-col justify-between h-full">
                    <div>
                        <h3 className="text-sm font-medium text-zinc-500 mb-1">Total Events</h3>
                        <p className="text-3xl font-bold">{stats?.events_count ?? 0}</p>
                    </div>
                </div>

                {/* Sales Card */}
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm flex flex-col justify-between h-full">
                    <div>
                        <h3 className="text-sm font-medium text-zinc-500 mb-1">Total Revenue</h3>
                        <div className="text-3xl font-bold truncate">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats?.total_sales ?? 0)}
                        </div>
                    </div>
                </div>

                {/* Tickets Card */}
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm flex flex-col justify-between h-full">
                    <div>
                        <h3 className="text-sm font-medium text-zinc-500 mb-1">Tickets Sold</h3>
                        <p className="text-3xl font-bold">{stats?.tickets_sold ?? 0}</p>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link
                        href="/admin/events"
                        className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-500 transition shadow text-center font-medium"
                    >
                        View All Events
                    </Link>
                    <Link
                        href="/admin/events/create"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-zinc-200 text-zinc-700 rounded hover:bg-gray-50 transition shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 text-center font-medium"
                    >
                        Create New Event
                    </Link>
                    <Link
                        href="/admin/settings?tab=team"
                        className="flex items-center justify-center px-4 py-3 bg-white border border-zinc-200 text-zinc-700 rounded hover:bg-gray-50 transition shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 text-center font-medium"
                    >
                        Manage Team
                    </Link>
                </div>
            </div>

            <div className="mt-12 p-6 bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Tenant Settings</h3>
                        <p className="text-sm text-zinc-500 max-w-xl">
                            Configure your branding, financial details, and team members from the settings page.
                        </p>
                    </div>
                    <Link
                        href="/admin/settings"
                        className="whitespace-nowrap px-6 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition"
                    >
                        Go to Settings
                    </Link>
                </div>
            </div>
        </div>
    );
}
