'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Users, MoreVertical, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface Event {
    id: string;
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    location: string;
    status: 'draft' | 'published' | 'ended' | 'cancelled';
    tenant_slug?: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data.data || data); // Handle both paginated and flat responses
            } else {
                throw new Error('Failed to load events');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                fetchEvents();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete event');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting event');
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading events...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Events</h1>
                    <p className="text-zinc-500 mt-2">Manage your events, tickets, and listings.</p>
                </div>
                <Link
                    href="/admin/events/new"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Create Event
                </Link>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            {events.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No events found</h3>
                    <p className="text-zinc-500 mt-2 mb-6">Get started by creating your first event.</p>
                    <Link
                        href="/admin/events/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition font-medium"
                    >
                        Create Event
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{event.name}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded ${event.status === 'published' ? 'bg-green-100 text-green-700' :
                                                event.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-zinc-100 text-zinc-600'
                                            }`}>
                                            {event.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(event.start_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {event.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/events/${event.id}/edit`}
                                        className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded transition"
                                        title="Edit Event"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                        title="Delete Event"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
