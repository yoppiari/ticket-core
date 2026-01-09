import { ReactNode } from "react";

export const metadata = {
    title: "Tukutix Scanner",
    description: "Offline Gate Access Control",
    manifest: "/manifest.json", // Need to generate this? Or assume existing
};

export default function ScannerLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
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
