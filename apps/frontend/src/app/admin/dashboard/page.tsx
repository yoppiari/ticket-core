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

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="font-bold text-xl tracking-tight">Ticketing.io</Link>
                        <span className="text-zinc-300">|</span>
                        <span className="font-medium text-zinc-600 dark:text-zinc-400">
                            {user?.tenant?.name || 'Tenant'} Dashboard
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-zinc-500 hidden md:inline-block">Logged in as {user?.email}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-200">
                        Error loading dashboard: {error}
                    </div>
                )}

                <h1 className="text-2xl font-bold mb-6">Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Events Card */}
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                        <h3 className="text-sm font-medium text-zinc-500 mb-1">Total Events</h3>
                        <p className="text-3xl font-bold">{stats?.events_count ?? 0}</p>
                    </div>

                    {/* Sales Card */}
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                        <h3 className="text-sm font-medium text-zinc-500 mb-1">Total Revenue</h3>
                        <p className="text-3xl font-bold">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(stats?.total_sales ?? 0)}
                        </p>
                    </div>

                    {/* Tickets Card */}
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                        <h3 className="text-sm font-medium text-zinc-500 mb-1">Tickets Sold</h3>
                        <p className="text-3xl font-bold">{stats?.tickets_sold ?? 0}</p>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="flex gap-4">
                        <Link href="/admin/events" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition shadow inline-block">
                            View All Events
                        </Link>
                        <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded hover:bg-gray-50 transition shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200">
                            Create New Event
                        </button>
                        <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded hover:bg-gray-50 transition shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200">
                            Manage Team
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
