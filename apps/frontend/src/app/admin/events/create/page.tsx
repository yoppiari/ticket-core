'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-zinc-100 animate-pulse rounded-xl"></div>
});

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-zinc-100 animate-pulse rounded-xl"></div>
});

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const statusRef = useRef('draft');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        start_date: '',
        end_date: '',
        venue_name: '',
        venue_address: '',
        latitude: '',
        longitude: '',
        description: '',
        terms_and_conditions: '',
        facilities: '',
        instagram_url: '',
        website_url: '',
        status: 'draft', // Default to draft
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from name if slug is empty or was auto-generated
        if (name === 'name' && (!formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const status = statusRef.current; // Read from ref

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    social_media: {
                        instagram: formData.instagram_url,
                        website: formData.website_url,
                    },
                    status: status
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to create event');
            }

            // Redirect to the events list on success
            // Redirect to the edit page on success so they can preview it
            router.push(`/admin/events/${data.id || data.event?.id}/edit`);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
            <header className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 mb-8">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/events" className="font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                            &larr; Back to Events
                        </Link>
                        <span className="font-bold text-xl">Create New Event</span>
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

                    {/* We remove local onSubmit and handle via button clicks */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-zinc-200">
                                    Event Name <span className="text-red-500">*</span>
                                </label>
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
                                <label htmlFor="slug" className="block text-sm font-medium mb-1 dark:text-zinc-200">
                                    URL Slug <span className="text-red-500">*</span>
                                </label>
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
                                    <label htmlFor="start_date" className="block text-sm font-medium mb-1 dark:text-zinc-200">
                                        Start Date & Time <span className="text-red-500">*</span>
                                    </label>
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
                                    <label htmlFor="end_date" className="block text-sm font-medium mb-1 dark:text-zinc-200">
                                        End Date & Time <span className="text-red-500">*</span>
                                    </label>
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
                                <label htmlFor="venue_name" className="block text-sm font-medium mb-1 dark:text-zinc-200">
                                    Venue Name <span className="text-red-500">*</span>
                                </label>
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

                            <div>
                                <RichTextEditor
                                    label="Description"
                                    value={formData.description}
                                    onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
                                    placeholder="Detailed event description..."
                                />
                            </div>

                            <div>
                                <RichTextEditor
                                    label="Terms & Conditions"
                                    value={formData.terms_and_conditions}
                                    onChange={(val) => setFormData(prev => ({ ...prev, terms_and_conditions: val }))}
                                    placeholder="Event policies, refunds, entrance rules..."
                                />
                            </div>

                            <div>
                                <label htmlFor="facilities" className="block text-sm font-medium mb-1 dark:text-zinc-200">Facilities (comma separated)</label>
                                <input
                                    type="text"
                                    id="facilities"
                                    name="facilities"
                                    value={formData.facilities}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Wifi, Parking, Food Court, First Aid..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="instagram_url" className="block text-sm font-medium mb-1 dark:text-zinc-200">Instagram URL</label>
                                    <input
                                        type="url"
                                        id="instagram_url"
                                        name="instagram_url"
                                        value={formData.instagram_url}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="website_url" className="block text-sm font-medium mb-1 dark:text-zinc-200">Website URL</label>
                                    <input
                                        type="url"
                                        id="website_url"
                                        name="website_url"
                                        value={formData.website_url}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-zinc-200">Location</label>
                                <LocationPicker
                                    onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }))}
                                />
                                <input type="hidden" name="latitude" value={formData.latitude} />
                                <input type="hidden" name="longitude" value={formData.longitude} />
                            </div>
                        </div>

                        <div className="pt-4 border-t dark:border-zinc-800 flex justify-end gap-3">
                            <Link
                                href="/admin/events"
                                className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                onClick={() => { statusRef.current = 'draft'; }}
                                disabled={loading}
                                className="px-5 py-2.5 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save as Draft'}
                            </button>
                            <button
                                type="submit"
                                onClick={() => { statusRef.current = 'published'; }}
                                disabled={loading}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Publishing...' : 'Publish Event'}
                            </button>
                        </div>
                        <p className="text-right text-xs text-zinc-500 -mt-3">
                            Save as Draft to preview before publishing.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    );
}
