'use client';

import { CreditCard, Users, Calendar, Ticket } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
                <p className="text-zinc-500 mt-2">Welcome back! Here&apos;s what&apos;s happening with your events.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value="Rp 45.000.000"
                    icon={CreditCard}
                    trend="+12% from last month"
                    trendUp={true}
                />
                <StatsCard
                    title="Tickets Sold"
                    value="1,234"
                    icon={Ticket}
                    trend="+5% from last month"
                    trendUp={true}
                />
                <StatsCard
                    title="Active Events"
                    value="3"
                    icon={Calendar}
                    trend="Same as last month"
                    trendUp={null}
                />
                <StatsCard
                    title="Total Customers"
                    value="892"
                    icon={Users}
                    trend="+18% from last month"
                    trendUp={true}
                />
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
                <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white">Recent Activity</h2>
                <div className="h-64 flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-lg">
                    Activity Chart Placeholder
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, trend, trendUp }: any) {
    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-zinc-500">{title}</h3>
                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-white">
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{value}</div>
            <div className={`text-xs flex items-center gap-1 ${trendUp === true ? 'text-green-600' :
                trendUp === false ? 'text-red-600' : 'text-zinc-500'
                }`}>
                <span>{trend}</span>
            </div>
        </div>
    );
}
