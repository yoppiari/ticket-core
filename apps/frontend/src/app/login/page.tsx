'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
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

            // Store token in localStorage for simplicity in this MVP
            // In production, consider HTTP-only cookies
            if (data.token) {
                localStorage.setItem('auth_token', data.token);
                // Also store user info if needed
                localStorage.setItem('user_info', JSON.stringify(data.user));
            }

            // Redirect based on role or default
            if (data.user?.role === 'owner' || data.user?.role === 'admin') {
                router.push('/admin/dashboard');
            } else if (data.user?.role === 'super_admin' || data.user?.role === 'system_admin') {
                // Prevent System Admin from logging in here
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_info');
                throw new Error("Please use the System Admin Portal to login.");
            } else {
                router.push('/');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
            <div className="mb-8 font-black text-2xl tracking-tighter text-zinc-900 dark:text-white">Tukutix</div>
            <div className="w-full max-w-sm bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-zinc-500 text-sm mt-2">Sign in to your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                        </div>
                        <input
                            type="password"
                            className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className="mt-6 text-center text-sm text-zinc-500">
                        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100 underline">
                            Back to Home
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
