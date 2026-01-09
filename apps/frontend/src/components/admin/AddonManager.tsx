'use client';

import { useState, useEffect } from 'react';

interface Addon {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    type: 'merch' | 'service' | 'parking';
}

export default function AddonManager({ eventId }: { eventId: string }) {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Addon | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        type: 'merch',
    });

    const fetchAddons = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/events/${eventId}/addons`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setAddons(data);
            } else {
                throw new Error('Failed to load addons');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddons();
    }, [eventId]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            type: 'merch',
        });
        setEditingItem(null);
        setShowForm(false);
        setError('');
    };

    const handleEdit = (item: Addon) => {
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            stock: item.stock.toString(),
            type: item.type,
        });
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this addon?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/addons/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                fetchAddons();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting addon');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const url = editingItem
                ? `${baseUrl}/api/admin/addons/${editingItem.id}`
                : `${baseUrl}/api/admin/events/${eventId}/addons`;

            const method = editingItem ? 'PUT' : 'POST';

            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                type: formData.type,
            };

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchAddons();
                resetForm();
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to save');
            }
        } catch (err: any) {
            setError(err.message || 'Error executing request');
        }
    };

    if (loading) return <div>Loading addons...</div>;

    return (
        <section className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Add-ons (Merch, Parking, etc.)</h2>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition"
                >
                    + Add Add-on
                </button>
            </div>

            {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded">{error}</div>}

            {showForm && (
                <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg border dark:border-zinc-800">
                    <h3 className="font-bold mb-4">{editingItem ? 'Edit Add-on' : 'New Add-on'}</h3>
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
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                    className="w-full px-3 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="merch">Merchandise</option>
                                    <option value="service">Service</option>
                                    <option value="parking">Parking</option>
                                </select>
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
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
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

            <div className="space-y-4">
                {addons.length === 0 ? (
                    <p className="text-zinc-500 italic">No add-ons defined.</p>
                ) : (
                    addons.map((addon) => (
                        <div key={addon.id} className="bg-white dark:bg-zinc-950 p-4 rounded border flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">{addon.type}</span>
                                    <h3 className="font-bold">{addon.name}</h3>
                                </div>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Price: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(addon.price)}
                                    <span className="mx-2">•</span>
                                    Stock: {addon.stock}
                                </p>
                                {addon.description && <p className="text-sm text-zinc-400 mt-1">{addon.description}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(addon)}
                                    className="text-sm px-3 py-1.5 border rounded hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(addon.id)}
                                    className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
