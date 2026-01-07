'use client';

import { useState, useEffect } from 'react';
import PricingTierManager from './PricingTierManager';

interface TicketType {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    sale_start_date: string | null;
    sale_end_date: string | null;
}

export default function TicketTypeManager({ eventId }: { eventId: string }) {
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<TicketType | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        sale_start_date: '',
        sale_end_date: '',
    });

    const fetchTicketTypes = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events/${eventId}/ticket-types`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTicketTypes(data);
            } else {
                throw new Error('Failed to load ticket types');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketTypes();
    }, [eventId]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            sale_start_date: '',
            sale_end_date: '',
        });
        setEditingItem(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (item: TicketType) => {
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            stock: item.stock.toString(),
            sale_start_date: item.sale_start_date ? new Date(item.sale_start_date).toISOString().slice(0, 16) : '',
            sale_end_date: item.sale_end_date ? new Date(item.sale_end_date).toISOString().slice(0, 16) : '',
        });
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ticket type?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/ticket-types/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchTicketTypes();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting ticket type');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const url = editingItem
                ? `${baseUrl}/api/admin/ticket-types/${editingItem.id}`
                : `${baseUrl}/api/admin/events/${eventId}/ticket-types`;

            const method = editingItem ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                sale_start_date: formData.sale_start_date || null,
                sale_end_date: formData.sale_end_date || null,
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchTicketTypes();
                resetForm();
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to save');
            }
        } catch (err: any) {
            setError(err.message || 'Error executing request');
        }
    };

    if (loading) return <div>Loading tickets...</div>;

    return (
        <section className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Ticket Types & Pricing</h2>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition"
                >
                    + Add Ticket Type
                </button>
            </div>

            {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded">{error}</div>}

            {showForm && (
                <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg border dark:border-zinc-800">
                    <h3 className="font-bold mb-4">{editingItem ? 'Edit Ticket Type' : 'New Ticket Type'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Stock</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full px-3 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.stock}
                                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sale Start</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.sale_start_date}
                                    onChange={e => setFormData({ ...formData, sale_start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sale End</label>
                                <input
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.sale_end_date}
                                    onChange={e => setFormData({ ...formData, sale_end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-zinc-600 hover:bg-zinc-200 rounded transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                            >
                                {editingItem ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {ticketTypes.length === 0 ? (
                    <p className="text-zinc-500 italic">No ticket types defined.</p>
                ) : (
                    ticketTypes.map((tt) => (
                        <div key={tt.id} className="border-b pb-6 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{tt.name}</h3>
                                    <p className="text-sm text-zinc-500">
                                        Price: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(tt.price)}
                                        <span className="mx-2">•</span>
                                        Stock: {tt.stock}
                                    </p>
                                    {tt.description && <p className="text-sm text-zinc-400 mt-1">{tt.description}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(tt)}
                                        className="text-sm px-3 py-1.5 border rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tt.id)}
                                        className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <PricingTierManager ticketType={tt} />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
