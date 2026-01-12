'use client';

import { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import MobileNav from '@/components/admin/MobileNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Mobile Header */}
            <div className="lg:hidden">
                <MobileNav onMenuClick={() => setSidebarOpen(true)} />
            </div>

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content */}
            <main className="lg:pl-72 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
