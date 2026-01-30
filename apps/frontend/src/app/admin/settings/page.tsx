'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Adjust import based on your UI lib
import TeamSettings from '@/components/admin/settings/TeamSettings';
import GeneralSettings from '@/components/admin/settings/GeneralSettings';
import dynamic from 'next/dynamic';

function AdminSettingsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const activeTab = searchParams.get('tab') || 'general';

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', value);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Settings</h1>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8 mb-8">
                    <TabsTrigger
                        value="general"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black px-0 py-3 text-zinc-500 hover:text-zinc-700 transition font-medium"
                    >
                        General
                    </TabsTrigger>
                    <TabsTrigger
                        value="team"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:text-black px-0 py-3 text-zinc-500 hover:text-zinc-700 transition font-medium"
                    >
                        Team
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <GeneralSettings />
                </TabsContent>

                <TabsContent value="team" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <TeamSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function AdminSettingsPage() {
    return (
        <Suspense fallback={<div className="p-8">Loading settings...</div>}>
            <AdminSettingsContent />
        </Suspense>
    );
}
