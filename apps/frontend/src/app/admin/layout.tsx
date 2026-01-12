'use client';

import { Sidebar } from '@/components/admin/Sidebar';
import { MobileNav } from '@/components/admin/MobileNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex">
            {/* Sidebar - Desktop/Tablet */}
            <div className="hidden md:block w-72 fixed inset-y-0 z-50">
                <Sidebar className="w-full h-full" />
            </div>

            {/* Main Content Wrapper */}
            <div className="flex-1 md:pl-72 flex flex-col min-h-screen">
                {/* Mobile Header - MobileNav handles hiding itself on md+ */}
                <MobileNav />

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
