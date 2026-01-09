'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateLoginPage() {
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/login`, {
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

            if (data.token) {
                // Security Check: Only allow 'user' role (Affiliates)
                // Reject 'owner', 'admin', 'super_admin'
                if (data.user.role !== 'user') {
                    // Revoke token immediately if possible, or just discard
                    localStorage.removeItem('auth_token');
                    throw new Error("This portal is for Affiliates only. Please use the Admin Login.");
                }

                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_info', JSON.stringify(data.user)); // Store user info for layout check

                // Redirect directly to affiliate dashboard
                router.push('/affiliate/dashboard');
            } else {
                throw new Error("No token received");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 font-sans">
            <div className="mb-8 flex flex-col items-center">
                <div className="font-black text-3xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Tukutix Partner
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Affiliate Program</p>
            </div>

            <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Partner Sign In</h1>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        </div>
                        <input
                            type="password"
                            className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-blue-500/30"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Don't have an affiliate account?{' '}
                        <Link href="/affiliate/register" className="text-blue-600 hover:text-blue-500 font-semibold">
                            Join Now
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
