'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Event {
    id: string;
    name: string;
    slug: string;
    start_date: string;
    status: string;
    venue_name: string;
}

export default function AdminEventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }

        fetchEvents(token);
    }, [router]);

    async function fetchEvents(token: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events`, {
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

            if (!res.ok) throw new Error('Failed to load events');

            const data = await res.json();
            setEvents(data);
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

    if (loading) return <div className="p-10 text-center">Loading events...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="font-bold text-xl tracking-tight">Tukutix</Link>
                        <span className="text-zinc-300">|</span>
                        <Link href="/admin/dashboard" className="font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                            Dashboard
                        </Link>
                        <span className="text-zinc-300">/</span>
                        <span className="font-medium text-black dark:text-white">
                            Events
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Events</h1>
                    <Link href="/admin/events/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition shadow">
                        Create New Event
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-200">
                        Error loading events: {error}
                    </div>
                )}

                <div className="bg-white dark:bg-zinc-950 rounded-xl border dark:border-zinc-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium text-zinc-500">Name</th>
                                <th className="px-6 py-4 font-medium text-zinc-500">Date</th>
                                <th className="px-6 py-4 font-medium text-zinc-500">Venue</th>
                                <th className="px-6 py-4 font-medium text-zinc-500">Status</th>
                                <th className="px-6 py-4 font-medium text-zinc-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-zinc-800">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                        No events found. Create one to get started.
                                    </td>
                                </tr>
                            ) : events.map((event) => (
                                <tr key={event.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                    <td className="px-6 py-4 font-medium">{event.name}</td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                        {new Date(event.start_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{event.venue_name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                                                event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/events/${event.id}`} className="text-blue-600 hover:underline">
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
