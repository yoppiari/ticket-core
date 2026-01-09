"use client";

export default function SystemDashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">System Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 mb-1">Total Tenants</h3>
                    <p className="text-3xl font-bold">12</p>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 mb-1">Total Revenue (Platform)</h3>
                    <p className="text-3xl font-bold">Rp 45.000.000</p>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-500 mb-1">Pending Withdrawals</h3>
                    <p className="text-3xl font-bold text-orange-600">3</p>
                </div>
            </div>

            <div className="mt-12">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Welcome, Super Admin</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        You have full access to manage tenants and approve functionality.
                        Please proceed with caution when managing live tenant data.
                    </p>
                </div>
            </div>
        </div>
    );
}
