"use client";

import { useState } from "react";
import { format } from "date-fns";

interface PricingTier {
    id: string;
    name: string;
    price: number;
    starts_at: string | null;
    ends_at: string | null;
    quantity_limit: number | null;
    priority: number;
}

interface TicketType {
    id: string;
    name: string;
    price: number;
}

export default function PricingTierManager({ ticketType }: { ticketType: TicketType }) {
    const [tiers, setTiers] = useState<PricingTier[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingTier, setEditingTier] = useState<PricingTier | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        starts_at: "",
        ends_at: "",
        quantity_limit: "",
        priority: "0",
    });

    const fetchTiers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("auth_token");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/ticket-types/${ticketType.id}/pricing-tiers`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Accept': 'application/json'
                    },
                }
            );
            if (res.ok) {
                const data = await res.json();
                setTiers(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("auth_token");
        const url = editingTier
            ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/pricing-tiers/${editingTier.id}`
            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/ticket-types/${ticketType.id}/pricing-tiers`;

        const method = editingTier ? "PUT" : "POST";

        const payload = {
            name: formData.name,
            price: parseFloat(formData.price),
            starts_at: formData.starts_at || null,
            ends_at: formData.ends_at || null,
            quantity_limit: formData.quantity_limit ? parseInt(formData.quantity_limit) : null,
            priority: parseInt(formData.priority),
        };

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    "Accept": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                fetchTiers();
                setShowForm(false);
                setEditingTier(null);
                setFormData({
                    name: "",
                    price: "",
                    starts_at: "",
                    ends_at: "",
                    quantity_limit: "",
                    priority: "0",
                });
            }
        } catch (error) {
            console.error("Failed to save tier", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/pricing-tiers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' },
        });

        if (res.ok) {
            fetchTiers();
        } else {
            const text = await res.text();
            console.error("Delete failed:", res.status, text);
            alert("Delete failed: " + text);
        }
    };

    // Initial Load
    useState(() => {
        fetchTiers();
    });

    return (
        <div className="mt-4 border rounded-md p-4 bg-zinc-50 dark:bg-zinc-900">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-sm">Pricing Tiers for {ticketType.name}</h4>
                <button
                    onClick={() => setShowForm(true)}
                    className="text-xs bg-zinc-800 text-white px-2 py-1 rounded"
                >
                    Add Tier
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-4 p-4 bg-white dark:bg-zinc-950 border rounded-md space-y-3">
                    <div>
                        <label className="block text-xs font-medium">Name</label>
                        <input
                            type="text"
                            className="w-full text-sm border p-1 rounded"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-medium">Price</label>
                            <input
                                type="number"
                                className="w-full text-sm border p-1 rounded"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium">Priority (0=Highest)</label>
                            <input
                                type="number"
                                className="w-full text-sm border p-1 rounded"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-xs font-medium">Starts At</label>
                            <input
                                type="datetime-local"
                                className="w-full text-sm border p-1 rounded"
                                value={formData.starts_at}
                                onChange={e => setFormData({ ...formData, starts_at: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium">Ends At</label>
                            <input
                                type="datetime-local"
                                className="w-full text-sm border p-1 rounded"
                                value={formData.ends_at}
                                onChange={e => setFormData({ ...formData, ends_at: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="text-xs px-2 py-1 border rounded">Cancel</button>
                        <button type="submit" className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Save</button>
                    </div>
                </form>
            )}

            {loading ? (
                <p className="text-xs text-zinc-500">Loading...</p>
            ) : tiers.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No custom tiers. Defaults to base price.</p>
            ) : (
                <ul className="space-y-2">
                    {tiers.map((tier) => (
                        <li key={tier.id} className="text-sm bg-white dark:bg-zinc-950 p-2 rounded border flex justify-between items-center">
                            <div>
                                <span className="font-medium">{tier.name}</span>
                                <span className="ml-2 text-zinc-500">
                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(tier.price)}
                                </span>
                                <div className="text-xs text-zinc-400">
                                    {tier.starts_at ? format(new Date(tier.starts_at), "PP p") : "Any"} - {tier.ends_at ? format(new Date(tier.ends_at), "PP p") : "Any"}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(tier.id)}
                                className="text-red-500 text-xs hover:underline"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
