'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Calendar, MapPin, Loader2, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TicketTypeManager from '@/components/admin/TicketTypeManager';
import AddonManager from '@/components/admin/AddonManager';

interface Event {
    id: string;
    name: string;
    slug: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    venue_name?: string;
    venue_address?: string;
    latitude?: number;
    longitude?: number;
    banner_url: string;
    status: 'draft' | 'published' | 'ended' | 'cancelled';
    tenant_slug?: string;
    terms_and_conditions?: string;
    facilities?: string;
    social_media?: any[];
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    // Unrap params based on Next.js 15+ async params
    const { id } = use(params);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('details');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState<Partial<Event>>({});

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/events/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                const eventData = data.data || data;
                setEvent(eventData);
                setFormData({
                    name: eventData.name,
                    slug: eventData.slug || '',
                    description: eventData.description || '',
                    start_date: eventData.start_date ? new Date(eventData.start_date).toISOString().slice(0, 16) : '',
                    end_date: eventData.end_date ? new Date(eventData.end_date).toISOString().slice(0, 16) : '',
                    venue_name: eventData.venue_name || '',
                    venue_address: eventData.venue_address || '',
                    latitude: eventData.latitude,
                    longitude: eventData.longitude,
                    status: eventData.status,
                    banner_url: eventData.banner_url || '',
                    terms_and_conditions: eventData.terms_and_conditions || '',
                    facilities: eventData.facilities || '',
                    social_media: eventData.social_media || []
                });
            } else {
                alert('Failed to load event');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/events/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Event updated successfully');
                fetchEvent(); // Refresh data
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to update event');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!event) return <div className="p-8 text-center">Event not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/events" className="p-2 hover:bg-zinc-100 rounded-full transition">
                    <ArrowLeft className="w-5 h-5 text-zinc-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">{event.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span className="uppercase font-bold tracking-wider text-xs bg-zinc-100 px-2 py-0.5 rounded">
                            {event.status}
                        </span>
                        <span>•</span>
                        <span>{id}</span>
                        {event.tenant_slug && (
                            <>
                                <span>•</span>
                                <a
                                    href={`/${event.tenant_slug}/e/${event.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                >
                                    View Public Page <LinkIcon className="w-3 h-3" />
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    {['Details', 'Location', 'Content', 'Tickets', 'Add-ons'].map((tab) => (
                        <TabsTrigger
                            key={tab}
                            value={tab.toLowerCase().replace(' ', '-')}
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black px-0 py-3 text-zinc-500 hover:text-zinc-700 transition"
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="mt-6">
                    {/* General Details Tab */}
                    <TabsContent value="details">
                        <form onSubmit={handleUpdate} className="max-w-2xl space-y-6 bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Event Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                        value={formData.name || ''}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 font-mono text-sm"
                                        value={formData.slug || ''}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                            value={formData.start_date || ''}
                                            onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Date</label>
                                        <input
                                            type="datetime-local"
                                            required
                                            className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                            value={formData.end_date || ''}
                                            onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                        value={formData.status || 'draft'}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="ended">Ended</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t dark:border-zinc-800 flex justify-end">
                                <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-zinc-800">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Location Tab */}
                    <TabsContent value="location">
                        <form onSubmit={handleUpdate} className="max-w-2xl space-y-6 bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Venue Name</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-9 p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                            value={formData.venue_name || ''}
                                            onChange={e => setFormData({ ...formData, venue_name: e.target.value })}
                                            placeholder="e.g. Jakarta Convention Center"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Venue Address</label>
                                    <textarea
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 h-24"
                                        value={formData.venue_address || ''}
                                        onChange={e => setFormData({ ...formData, venue_address: e.target.value })}
                                        placeholder="Full address of the venue"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Latitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                            value={formData.latitude || ''}
                                            onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Longitude</label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                            value={formData.longitude || ''}
                                            onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    Get these coordinates from Google Maps (right click on a location).
                                </p>
                            </div>
                            <div className="pt-4 border-t dark:border-zinc-800 flex justify-end">
                                <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-zinc-800">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Location
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Content & Media Tab */}
                    <TabsContent value="content">
                        <form onSubmit={handleUpdate} className="max-w-2xl space-y-6 bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Banner URL</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800"
                                        value={formData.banner_url || ''}
                                        onChange={e => setFormData({ ...formData, banner_url: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 h-32"
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Event description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                                    <textarea
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 h-32"
                                        value={formData.terms_and_conditions || ''}
                                        onChange={e => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                                        placeholder="Terms and conditions..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Facilities</label>
                                    <textarea
                                        className="w-full p-2 border rounded-lg dark:bg-zinc-900 dark:border-zinc-800 h-24"
                                        value={formData.facilities || ''}
                                        onChange={e => setFormData({ ...formData, facilities: e.target.value })}
                                        placeholder="Parking, WiFi, Toilet, etc..."
                                    />
                                </div>
                            </div>
                            <div className="pt-4 border-t dark:border-zinc-800 flex justify-end">
                                <Button type="submit" disabled={saving} className="bg-black text-white hover:bg-zinc-800">
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Content
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="tickets">
                        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <TicketTypeManager eventId={id} />
                        </div>
                    </TabsContent>

                    <TabsContent value="add-ons">
                        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <AddonManager eventId={id} />
                        </div>
                    </TabsContent>


                </div>
            </Tabs>
        </div>
    );
}
