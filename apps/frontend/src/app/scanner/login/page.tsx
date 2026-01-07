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

            // Token handling? Sanctum cookies usually handled by browser.
            // If stateless token, might need to store it.
            // Let's assume cookie-based session for now.

            router.push('/scanner/scan');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center">Staff Login</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow transition disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Enter Scanner Mode'}
                    </button>
                </form>
            </div>
        </div>
    );
}
