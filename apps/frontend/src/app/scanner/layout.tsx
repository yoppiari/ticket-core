import { ReactNode } from "react";
import type { Viewport } from "next";

export const metadata = {
    title: 'Tukutix Scanner',
    description: 'Scanner App for Tukutix Gate Staff',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Tukutix Scanner',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#000000',
};

export default function ScannerLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <div className="min-h-screen bg-black text-white">
            {/* 
        Scanner App Header 
        Simple, high contrast, no navigation links to consumer pages
      */}
            <header className="flex items-center justify-between p-4 bg-black border-b border-gray-800">
                <h1 className="text-xl font-bold tracking-tight text-white">
                    🎟️ Gate Scanner
                </h1>
                <div className="text-xs text-gray-400">
                    {/* Connection Status Indicator will go here */}
                    Online
                </div>
            </header>

            <main className="p-4">
                {children}
            </main>
        </div>
    );
}
