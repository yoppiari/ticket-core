'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditEventPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        start_date: '',
        end_date: '',
        venue_name: '',
        venue_address: '',
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/login');
                    return;
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    }
                });

                if (!res.ok) throw new Error('Failed to load event');

                const data = await res.json();

                // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
                const formatDate = (dateString: string) => {
                    if (!dateString) return '';
                    return new Date(dateString).toISOString().slice(0, 16);
                };

                setFormData({
                    name: data.name || '',
                    slug: data.slug || '',
                    start_date: formatDate(data.start_date),
                    end_date: formatDate(data.end_date),
                    venue_name: data.venue_name || '',
                    venue_address: data.venue_address || '',
                });
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEvent();
        }
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update event');
            }

            // Redirect to the event details on success
            router.push(`/admin/events/${id}`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading event...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
            <header className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 mb-8">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/events/${id}`} className="font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                            &larr; Back to Event Details
                        </Link>
                        <span className="font-bold text-xl">Edit Event</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 max-w-2xl">
                <div className="bg-white dark:bg-zinc-950 p-8 rounded-xl border dark:border-zinc-800 shadow-sm">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-zinc-200">Event Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="e.g. Summer Music Festival 2024"
                                />
                            </div>

                            <div>
                                <label htmlFor="slug" className="block text-sm font-medium mb-1 dark:text-zinc-200">URL Slug</label>
                                <div className="flex items-center">
                                    <span className="bg-zinc-100 dark:bg-zinc-800 border border-r-0 border-zinc-300 dark:border-zinc-700 rounded-l-lg px-3 py-2 text-zinc-500 text-sm">
                                        /events/
                                    </span>
                                    <input
                                        type="text"
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                        className="flex-1 px-4 py-2 border rounded-r-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="summer-music-festival-2024"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">Unique identifier for the event URL.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="start_date" className="block text-sm font-medium mb-1 dark:text-zinc-200">Start Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        id="start_date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="end_date" className="block text-sm font-medium mb-1 dark:text-zinc-200">End Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        id="end_date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="venue_name" className="block text-sm font-medium mb-1 dark:text-zinc-200">Venue Name</label>
                                <input
                                    type="text"
                                    id="venue_name"
                                    name="venue_name"
                                    value={formData.venue_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="e.g. Central Park"
                                />
                            </div>

                            <div>
                                <label htmlFor="venue_address" className="block text-sm font-medium mb-1 dark:text-zinc-200">Venue Address</label>
                                <textarea
                                    id="venue_address"
                                    name="venue_address"
                                    value={formData.venue_address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Full address of the venue"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-zinc-800 flex justify-end gap-3">
                            <Link
                                href={`/admin/events/${id}`}
                                className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
