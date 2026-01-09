"use client";

import { SystemSidebar } from "@/components/system/SystemSidebar";

export default function SystemLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-900">
            <SystemSidebar className="w-64 hidden md:flex fixed h-full z-10" />
            <div className="flex-1 md:ml-64">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
