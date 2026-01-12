"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Plus, X } from "lucide-react";

interface Tenant {
    id: string;
    name: string;
    slug: string;
    status: string;
    created_at: string;
}

export default function SystemTenantsPage() {
    const router = useRouter();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        email: "",
        password: ""
    });

    useEffect(() => {
        fetchTenants();
    }, []);

    async function fetchTenants() {
        const token = localStorage.getItem("auth_token");
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/tenants`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            });
            if (res.ok) setTenants(await res.json());
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setFormLoading(true);
        const token = localStorage.getItem("auth_token");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/tenants`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("Tenant created successfully!");
                setShowModal(false);
                setFormData({ name: "", slug: "", email: "", password: "" });
                fetchTenants();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to create tenant");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating tenant");
        } finally {
            setFormLoading(false);
        }
    }

    if (loading) return <div>Loading tenants...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Tenant Management</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-500">Total: {tenants.length}</span>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-md font-medium hover:opacity-90 transition"
                    >
                        <Plus className="h-4 w-4" />
                        Add Tenant
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-xl border dark:border-zinc-800 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-medium border-b dark:border-zinc-800">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Slug</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-zinc-800">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
                                <td className="px-6 py-4 font-medium">{tenant.name}</td>
                                <td className="px-6 py-4 font-mono text-zinc-500">{tenant.slug}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {tenant.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-zinc-500">
                                    {new Date(tenant.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:text-blue-800 font-medium">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Tenant Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl shadow-xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b dark:border-zinc-800">
                            <h3 className="font-bold text-lg">Add New Tenant</h3>
                            <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Tenant Name</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Slug (URL)</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Owner Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Owner Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-md font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-md font-medium hover:opacity-90 disabled:opacity-50"
                                >
                                    {formLoading ? 'Creating...' : 'Create Tenant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
