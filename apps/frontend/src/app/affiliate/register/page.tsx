'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AffiliateRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        referral_code: '',
        bank_name: '',
        bank_number: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login?redirect=/affiliate/register');
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/affiliates/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    referral_code: formData.referral_code || undefined,
                    bank_details: {
                        bank: formData.bank_name,
                        number: formData.bank_number
                    }
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Success
            router.push('/affiliate/marketplace');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Become an Affiliate
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Start earning commissions by promoting events.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="referral_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Preferred Referral Code (Optional)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="referral_code"
                                    name="referral_code"
                                    type="text"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g. YOURNAME"
                                    value={formData.referral_code}
                                    onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Bank Details (for Payouts)
                            </label>
                            <div className="mt-1 grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="Bank Name"
                                    value={formData.bank_name}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                                    placeholder="Account Number"
                                    value={formData.bank_number}
                                    onChange={(e) => setFormData({ ...formData, bank_number: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Registering...' : 'Join Now'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
