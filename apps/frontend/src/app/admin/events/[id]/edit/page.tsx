'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ExternalLinkIcon, EyeIcon, GlobeIcon, TrashIcon, XIcon, AlertTriangleIcon } from 'lucide-react';

const LocationPicker = dynamic(() => import('@/components/admin/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-zinc-100 animate-pulse rounded-xl"></div>
});

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-zinc-100 animate-pulse rounded-xl"></div>
});

export default function EditEventPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

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
        status: 'draft',
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
                    latitude: data.latitude || '',
                    longitude: data.longitude || '',
                    description: data.description || '',
                    terms_and_conditions: data.terms_and_conditions || '',
                    facilities: data.facilities || '',
                    instagram_url: data.social_media?.instagram || '',
                    website_url: data.social_media?.website || '',
                    status: data.status || 'draft',
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

    const handleSubmit = async (e?: React.FormEvent, newStatus?: string) => {
        if (e) e.preventDefault();
        setSaving(true);
        setError('');

        const statusToSave = newStatus || formData.status;

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
                body: JSON.stringify({
                    ...formData,
                    social_media: {
                        instagram: formData.instagram_url,
                        website: formData.website_url,
                    },
                    status: statusToSave
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to update event');
            }

            // Update local status if changed
            setFormData(prev => ({ ...prev, status: statusToSave }));

            // router.push(`/admin/events/${id}`); // Don't redirect, just stay and show success or toast? For now just stay.
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmation !== formData.name) return;

        setDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete event');
            }

            router.push('/admin/events');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred during deletion');
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading event...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden border dark:border-zinc-800">
                        <div className="p-6">
                            <div className="flex items-center gap-4 text-red-600 mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertTriangleIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold">Delete Event?</h3>
                            </div>

                            <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                                This action cannot be undone. This will permanently delete
                                <span className="font-bold text-zinc-900 dark:text-zinc-100"> {formData.name} </span>
                                and remove all data associated with it.
                            </p>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Type <span className="font-mono font-bold select-all bg-zinc-100 dark:bg-zinc-800 px-1 rounded">{formData.name}</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder={formData.name}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-zinc-950 dark:border-zinc-800 focus:ring-2 focus:ring-red-500 outline-none"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t dark:border-zinc-800 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }}
                                className="px-4 py-2 text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirmation !== formData.name || deleting}
                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {deleting ? 'Deleting...' : 'Delete Event'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 mb-8 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/events/${id}`} className="font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                            &larr; Back
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-xl">Edit Event</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${formData.status === 'published'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                                }`}>
                                {formData.status === 'published' ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={`/demo/e/${formData.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                            <EyeIcon className="w-4 h-4" />
                            Preview
                        </a>

                        {formData.status === 'draft' ? (
                            <button
                                type="button"
                                onClick={() => handleSubmit(undefined, 'published')}
                                disabled={saving}
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium shadow-sm disabled:opacity-50"
                            >
                                Publish
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSubmit(undefined, 'draft')}
                                disabled={saving}
                                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium shadow-sm disabled:opacity-50"
                            >
                                Unpublish
                            </button>
                        )}

                        <button
                            onClick={(e) => handleSubmit(e)}
                            disabled={saving}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium shadow-sm disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
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

                    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-zinc-200">Location</label>
                            {formData.latitude && (
                                <LocationPicker
                                    latitude={parseFloat(formData.latitude)}
                                    longitude={parseFloat(formData.longitude)}
                                    onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }))}
                                    initialAddress={formData.venue_name}
                                />
                            )}
                            {!formData.latitude && (
                                <LocationPicker
                                    onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }))}
                                    initialAddress={formData.venue_name}
                                />
                            )}
                            <input type="hidden" name="latitude" value={formData.latitude} />
                            <input type="hidden" name="longitude" value={formData.longitude} />
                        </div>


                        <div className="mt-12 pt-8 border-t dark:border-zinc-800">
                            <div className="flex items-center justify-between p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                                <div>
                                    <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-1">Danger Zone</h3>
                                    <p className="text-sm text-red-700 dark:text-red-500/80">
                                        Permanently remove this event and all of its data.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-4 py-2 bg-white dark:bg-zinc-950 text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    Delete Event
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
