'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScannerLoginPage() {
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
            // Use standard Sanctum auth or custom endpoint? 
            // Let's assume standard Next.js / Laravel Sanctum pattern.
            // Assuming we have a global auth helper or just hit API directly.
            // Let's hit the backend directly for MVP.

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                throw new Error('Invalid credentials');
            }

            const data = await res.json();

            // Store token for offline PWA usage
            localStorage.setItem('auth_token', data.token);
            if (data.user) {
                localStorage.setItem('auth_user', JSON.stringify(data.user));
            }

            router.push('/scanner/scan');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4">
            <div className="mb-8 text-center">
                <div className="font-black text-2xl tracking-tighter text-white">SCANNER<span className="text-blue-500">APP</span></div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Staff Access Only</p>
            </div>

            <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800 ring-1 ring-white/5">
                <h2 className="text-xl font-bold mb-6 text-center text-white">Sign In</h2>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-zinc-500">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-zinc-700"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="staff@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-zinc-500">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition placeholder:text-zinc-700"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Verifying...' : 'Access Scanner'}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center">
                <div className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                    Authorized Personnel Only
                </div>
            </div>
        </div>
    );
}
