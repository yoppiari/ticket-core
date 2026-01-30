'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EventFormData {
    name: string;
    slug: string;
    start_date: string;
    end_date: string;
    venue_name: string;
    venue_address: string;
    status: 'draft' | 'published';
    description: string;
    affiliate_enabled: boolean;
    commission_type: 'percent' | 'fixed';
    commission_value: number;
}

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<EventFormData>({
        name: '',
        slug: '',
        start_date: '',
        end_date: '',
        venue_name: '',
        venue_address: '',
        status: 'draft',
        description: '',
        affiliate_enabled: false,
        commission_type: 'percent',
        commission_value: 0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const data = await res.json();
                const eventId = data.id || data.data?.id;
                if (eventId) {
                    router.push(`/admin/events/${eventId}/edit`);
                } else {
                    router.push('/admin/events');
                }
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to create event');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        // Auto-generate slug from name if slug is empty or simple match
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setFormData(prev => ({
            ...prev,
            name,
            slug: prev.slug && prev.slug !== slug ? prev.slug : slug
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/events" className="p-2 hover:bg-zinc-100 rounded-full transition">
                    <ArrowLeft className="w-5 h-5 text-zinc-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Create New Event</h1>
                    <p className="text-zinc-500 text-sm">Enter the basic details to get started.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Event Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                            value={formData.name}
                            onChange={handleNameChange}
                            placeholder="e.g. Summer Music Festival 2026"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 font-mono text-sm"
                            value={formData.slug}
                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="summer-music-festival-2026"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Start Date</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">End Date</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                value={formData.end_date}
                                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t dark:border-zinc-800">
                        <label className="block text-sm font-medium mb-1">Venue Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                            value={formData.venue_name}
                            onChange={e => setFormData({ ...formData, venue_name: e.target.value })}
                            placeholder="e.g. Jakarta Convention Center"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Venue Address</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                            value={formData.venue_address}
                            onChange={e => setFormData({ ...formData, venue_address: e.target.value })}
                            placeholder="Main Hall, Jl. Jend. Sudirman..."
                        />
                    </div>

                    <div className="pt-4 border-t dark:border-zinc-800">
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="affiliate_enabled"
                                className="w-4 h-4 rounded border-zinc-300 text-black focus:ring-black"
                                checked={formData.affiliate_enabled}
                                onChange={e => setFormData({ ...formData, affiliate_enabled: e.target.checked })}
                            />
                            <label htmlFor="affiliate_enabled" className="text-sm font-medium">Enable Affiliate Program</label>
                        </div>

                        {formData.affiliate_enabled && (
                            <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Commission Type</label>
                                    <select
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                        value={formData.commission_type}
                                        onChange={e => setFormData({ ...formData, commission_type: e.target.value as any })}
                                    >
                                        <option value="percent">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (IDR)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Commission Value</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step={formData.commission_type === 'percent' ? '0.1' : '1000'}
                                        required={formData.affiliate_enabled}
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                        value={formData.commission_value}
                                        onChange={e => setFormData({ ...formData, commission_value: parseFloat(e.target.value) })}
                                    />
                                    <p className="text-xs text-zinc-500 mt-1">
                                        {formData.commission_type === 'percent'
                                            ? 'Enter percentage (e.g. 10 for 10%)'
                                            : 'Enter amount in IDR (e.g. 10000)'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-zinc-800">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Create Event
                    </Button>
                </div>
            </form>
        </div>
    );
}
