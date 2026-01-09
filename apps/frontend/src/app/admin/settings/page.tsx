"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Basic Card Components (Inline for portability if missing)
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`bg-white dark:bg-zinc-950 rounded-xl border dark:border-zinc-800 shadow-sm ${className}`}>{children}</div>;
}
function CardHeader({ children }: { children: React.ReactNode }) {
    return <div className="p-6 border-b dark:border-zinc-800">{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{children}</h3>;
}
function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}

export default function TenantSettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Derived state from URL or default
    const currentTab = searchParams.get("tab") || "general";

    function handleTabChange(value: string) {
        // Update URL without reload
        // Safe to use window here as it's triggered by user interaction
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("tab", value);
        router.push(newUrl.pathname + newUrl.search);
    }

    // Team State
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("staff");
    const [inviteLoading, setInviteLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        brand_color: "#2563eb",
        logo_url: "",
        bank_name: "",
        account_number: "",
        account_holder: "",
        show_past_events: true,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            // Fetch User & Tenant
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/me`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            });
            if (!res.ok) throw new Error("Failed to load user");
            const userData = await res.json();
            setUser(userData);

            // Populate Form
            const settings = userData.tenant?.settings || {};
            const branding = userData.tenant?.branding || {};
            setFormData({
                brand_color: branding.primary_color || "#2563eb",
                logo_url: branding.logo || "",
                bank_name: settings.bank_details?.bank_name || "",
                account_number: settings.bank_details?.account_number || "",
                account_holder: settings.bank_details?.account_holder || "",
                show_past_events: settings.show_past_events !== false,
            });

            // Fetch Team
            fetchTeam(token);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function fetchTeam(token: string) {
        setLoadingTeam(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/team`, {
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
            });
            if (res.ok) {
                setTeamMembers(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTeam(false);
        }
    }

    async function handleSaveSettings() {
        setSaving(true);
        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/tenants/${user.tenant.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    branding: {
                        logo: formData.logo_url,
                        primary_color: formData.brand_color
                    },
                    settings: {
                        show_past_events: formData.show_past_events,
                        bank_details: {
                            bank_name: formData.bank_name,
                            account_number: formData.account_number,
                            account_holder: formData.account_holder
                        }
                    }
                })
            });

            if (res.ok) {
                alert("Settings saved successfully!");
                fetchSettings(); // Refresh
            } else {
                alert("Failed to save settings");
            }
        } catch (e) {
            console.error(e);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    }

    async function handleInvite() {
        if (!inviteEmail) return;
        setInviteLoading(true);
        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/team/invite`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });
            if (res.ok) {
                alert("Invitation sent!");
                setInviteEmail("");
            } else {
                const err = await res.json();
                alert(err.message || "Failed to invite");
            }
        } catch (e) {
            console.error(e);
            alert("Error sending invitation");
        } finally {
            setInviteLoading(false);
        }
    }

    async function handleRemoveMember(id: number) {
        if (!confirm("Are you sure you want to remove this member?")) return;
        const token = localStorage.getItem("auth_token");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/team/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            if (res.ok) {
                fetchTeam(token!);
            } else {
                alert("Failed to remove member");
            }
        } catch (e) {
            console.error(e);
            alert("Error removing member");
        }
    }

    if (loading) return <div className="p-10 text-center">Loading settings...</div>;



    // ... (rest of the component)

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="font-bold text-xl tracking-tight">Tukutix</Link>
                        <span className="text-zinc-300">|</span>
                        <Link href="/admin/dashboard" className="font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900">
                            Dashboard
                        </Link>
                        <span className="text-zinc-300">/</span>
                        <span className="font-bold text-zinc-900 dark:text-white">Settings</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Tenant Settings</h1>
                        <p className="text-zinc-500">Manage your organization profile, team, and preferences.</p>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition shadow disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
                    <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <TabsTrigger value="general" className="px-4 py-2">General & Branding</TabsTrigger>
                        <TabsTrigger value="finance" className="px-4 py-2">Financials</TabsTrigger>
                        <TabsTrigger value="team" className="px-4 py-2">Team</TabsTrigger>
                        <TabsTrigger value="config" className="px-4 py-2">Page Config</TabsTrigger>
                    </TabsList>

                    {/* GENERAL & BRANDING */}
                    <TabsContent value="general">
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tenant Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
                                            value={user?.tenant?.name || ""}
                                            disabled // Edit name usually restricted
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">To change your organization name, please contact support.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">URL Slug</label>
                                        <div className="flex gap-2">
                                            <div className="px-3 py-2 bg-zinc-100 border rounded dark:bg-zinc-800 dark:border-zinc-700 text-zinc-500 font-mono text-sm">
                                                tukutix.com/
                                            </div>
                                            <input
                                                type="text"
                                                className="flex-1 p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700 font-mono text-sm"
                                                value={user?.tenant?.slug || ""}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Branding</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Primary Color</label>
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="color"
                                                className="h-10 w-10 p-0 border-0 rounded cursor-pointer"
                                                value={formData.brand_color}
                                                onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                className="w-32 p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700 uppercase font-mono"
                                                value={formData.brand_color}
                                                onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Logo URL</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
                                            placeholder="https://example.com/logo.png"
                                            value={formData.logo_url}
                                            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                        />
                                        {formData.logo_url && (
                                            <div className="mt-2 p-2 border rounded bg-zinc-50 inline-block">
                                                <img src={formData.logo_url} alt="Logo Preview" className="h-12 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* FINANCIALS */}
                    <TabsContent value="finance">
                        <Card>
                            <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-zinc-500 mb-4 bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200">
                                    These details will be used for processing your withdrawal requests. Ensure they match the Tenant Owner's legal identity.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Bank Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
                                            placeholder="e.g. BCA, Mandiri"
                                            value={formData.bank_name}
                                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700 font-mono"
                                            placeholder="1234567890"
                                            value={formData.account_number}
                                            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
                                            placeholder="Name on Bank Account"
                                            value={formData.account_holder}
                                            onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TEAM */}
                    <TabsContent value="team">
                        <Card>
                            <CardHeader><CardTitle>Team Management</CardTitle></CardHeader>
                            <CardContent>
                                <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">Hak Akses Role</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                                        <div className="space-y-1">
                                            <p><span className="font-bold text-purple-700 dark:text-purple-400">Owner:</span> Akses penuh (Kelola Tim, Keuangan, Event)</p>
                                            <p><span className="font-bold text-blue-700 dark:text-blue-400">Admin:</span> Kelola Event & Laporan (Tanpa akses Tim/Bank)</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p><span className="font-bold text-zinc-700 dark:text-zinc-300">Staff:</span> Edit Event terbatas (Tidak bisa Hapus Event/Kelola Tim)</p>
                                            <p><span className="font-bold text-green-700 dark:text-green-400">Scanner:</span> Hanya akses aplikasi Scanner (Check-in)</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded mb-6 border dark:border-zinc-800 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium uppercase text-zinc-500 mb-1">New Member Email</label>
                                        <input
                                            type="email"
                                            className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
                                            placeholder="colleague@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-40">
                                        <label className="block text-xs font-medium uppercase text-zinc-500 mb-1">Role</label>
                                        <select
                                            className="w-full p-2 border rounded dark:bg-zinc-900 dark:border-zinc-700"
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value)}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="staff">Staff</option>
                                            <option value="scanner">Scanner</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleInvite}
                                        disabled={!inviteEmail || inviteLoading}
                                        className="px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded hover:opacity-90 transition disabled:opacity-50"
                                    >
                                        {inviteLoading ? "Sending..." : "Invite"}
                                    </button>
                                </div>

                                {loadingTeam ? <p className="text-center py-4">Loading members...</p> : (
                                    <div className="space-y-1">
                                        {teamMembers.map(member => (
                                            <div key={member.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded border-b last:border-0 border-zinc-100 dark:border-zinc-800">
                                                <div>
                                                    <div className="font-medium">{member.name}</div>
                                                    <div className="text-sm text-zinc-500">{member.email}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                                                        member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-zinc-100 text-zinc-700'
                                                        }`}>
                                                        {member.role}
                                                    </span>
                                                    {member.role !== 'owner' && member.id !== user.id && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CONFIG */}
                    <TabsContent value="config">
                        <Card>
                            <CardHeader><CardTitle>Public Page Configuration</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded dark:border-zinc-700">
                                    <div>
                                        <h4 className="font-medium">Show Past Events</h4>
                                        <p className="text-sm text-zinc-500">Allow visitors to see events that have ended on your profile page.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.show_past_events}
                                            onChange={(e) => setFormData({ ...formData, show_past_events: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
