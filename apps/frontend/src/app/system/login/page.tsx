'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function SystemLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Invalid credentials');
            }

            const data = await res.json();

            // Strict Role Check
            if (data.user?.role !== 'super_admin' && data.user?.role !== 'system_admin') {
                throw new Error("Unauthorized Access. This portal is for System Administrators only.");
            }

            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_info', JSON.stringify(data.user));
            }

            router.push('/system/dashboard');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 text-white">
            <div className="mb-8 flex items-center gap-2 text-2xl font-black tracking-tighter">
                <ShieldAlert className="w-8 h-8 text-red-600" />
                <span>Tukutix System</span>
            </div>

            <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-800">
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold tracking-tight text-white mb-2">Restricted Access</h1>
                    <div className="text-xs font-mono text-red-400 bg-red-950/30 py-1 rounded border border-red-900/50 inline-block px-3">
                        AUTHORIZED PERSONNEL ONLY
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-900/20 border border-red-900/50 text-red-500 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium mb-2 text-zinc-400 uppercase tracking-wider">System ID (Email)</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-md border border-zinc-800 bg-black text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@tukutix.com"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider">Access Key</label>
                        </div>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-md border border-zinc-800 bg-black text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-white text-black font-bold rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50 mt-4 uppercase tracking-wide text-sm"
                    >
                        {loading ? 'Authenticating...' : 'Authenticate'}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-zinc-600 text-xs text-center w-full max-w-xs">
                <p>Access to this system is monitored and logged.</p>
                <p>IP Address: 127.0.0.1</p>
            </div>
        </div>
    );
}
