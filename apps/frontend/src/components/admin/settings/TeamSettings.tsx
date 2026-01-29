'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Mail, Shield, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function TeamSettings() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('admin');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/team`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMembers(data);
            }
        } catch (error) {
            console.error('Failed to fetch team:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/team/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });

            if (res.ok) {
                alert('Invitation sent successfully!');
                setInviteEmail('');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to send invitation');
            }
        } catch (error) {
            console.error(error);
            alert('Error sending invitation');
        } finally {
            setInviting(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/team/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchMembers();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to remove member');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Loading team...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end border-b pb-6">
                <div>
                    <h2 className="text-xl font-bold">Team Members</h2>
                    <p className="text-zinc-500 text-sm">Manage who has access to your dashboard.</p>
                </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Invite New Member
                </h3>
                <form onSubmit={handleInvite} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                            placeholder="colleague@example.com"
                            value={inviteEmail}
                            onChange={e => setInviteEmail(e.target.value)}
                        />
                    </div>
                    <div className="w-40">
                        <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">Role</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700"
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value)}
                        >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="scanner">Scanner</option>
                        </select>
                    </div>
                    <Button type="submit" disabled={inviting}>
                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Send Invite
                    </Button>
                </form>
            </div>

            <div className="space-y-4">
                {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border rounded-xl hover:border-zinc-300 transition">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-lg text-zinc-500">
                                {member.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{member.name}</div>
                                <div className="text-sm text-zinc-500">{member.email}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <Badge variant="secondary" className="uppercase text-[10px] tracking-widest font-bold">
                                {member.role}
                            </Badge>
                            <div className="text-sm text-zinc-400">
                                Since {new Date(member.created_at).toLocaleDateString()}
                            </div>
                            {member.role !== 'owner' && (
                                <button
                                    onClick={() => handleRemove(member.id)}
                                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                    title="Remove Member"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {members.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        No team members found.
                    </div>
                )}
            </div>
        </div>
    );
}
