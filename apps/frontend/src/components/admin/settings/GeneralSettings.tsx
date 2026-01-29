'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function GeneralSettings() {
    const { user } = useAuth(); // Assuming this hook provides current user/tenant info
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        primary_color: '#000000',
        bank_name: '',
        account_number: '',
        account_holder: ''
    });

    useEffect(() => {
        // Fetch current tenant settings
        // Ideally this comes from a "get my tenant" endpoint or user.tenant
        // For MVP, if we don't have a direct endpoint, we might rely on what's in 'user'
        // But let's assume we can fetch it or it's passed in.
        // Implementing a fetch for robustness:
        if (user && user.tenant_slug) {
            fetchTenant(user.tenant_slug);
        }
    }, [user]);

    const fetchTenant = async (slug: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/tenants/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name || '',
                    primary_color: data.branding?.primary_color || '#000000',
                    bank_name: data.settings?.bank_details?.bank_name || '',
                    account_number: data.settings?.bank_details?.account_number || '',
                    account_holder: data.settings?.bank_details?.account_holder || '',
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/tenants/${user?.tenant_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    branding: {
                        primary_color: formData.primary_color
                    },
                    settings: {
                        bank_details: {
                            bank_name: formData.bank_name,
                            account_number: formData.account_number,
                            account_holder: formData.account_holder
                        }
                    }
                })
            });

            if (res.ok) {
                alert('Settings updated successfully!');
            } else {
                alert('Failed to update settings');
            }
        } catch (error) {
            console.error('Update failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <div className="border-b pb-6">
                <h2 className="text-xl font-bold">General Settings</h2>
                <p className="text-zinc-500 text-sm">Update your organization profile and payment details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="org_name">Organization Name</Label>
                    <Input
                        id="org_name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="primary_color">Brand Color</Label>
                    <div className="flex gap-4 items-center">
                        <Input
                            id="primary_color"
                            type="color"
                            className="w-20 h-10 p-1"
                            value={formData.primary_color}
                            onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                        />
                        <span className="text-sm font-mono text-zinc-500">{formData.primary_color}</span>
                    </div>
                </div>

                <div className="pt-6 border-t">
                    <h3 className="text-lg font-bold mb-4">Bank Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input
                                id="bank_name"
                                placeholder="e.g. BCA, Mandiri"
                                value={formData.bank_name}
                                onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="account_number">Account Number</Label>
                            <Input
                                id="account_number"
                                placeholder="1234567890"
                                value={formData.account_number}
                                onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="account_holder">Account Holder Name</Label>
                            <Input
                                id="account_holder"
                                placeholder="Name on bank account"
                                value={formData.account_holder}
                                onChange={e => setFormData({ ...formData, account_holder: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <Button type="submit" disabled={loading} className="bg-zinc-900 text-white hover:bg-zinc-800">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
