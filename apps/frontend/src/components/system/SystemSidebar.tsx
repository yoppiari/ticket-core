"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Wallet,
    Settings,
    LogOut,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    {
        title: "Overview",
        url: "/system/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Tenants",
        url: "/system/tenants",
        icon: Building2,
    },
    {
        title: "Finance",
        url: "/system/finance",
        icon: Wallet,
    },
    {
        title: "Settings",
        url: "/system/settings",
        icon: Settings,
    },
];

export function SystemSidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <div className={cn("flex flex-col h-screen border-r bg-zinc-900 text-zinc-300 border-zinc-800", className)}>
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
                    <ShieldAlert className="h-6 w-6 text-red-500" />
                    <span>Tukutix System</span>
                </Link>
            </div>

            <div className="flex-1 px-4 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.url || (item.url !== '/system/dashboard' && pathname.startsWith(item.url));

                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-zinc-800 text-white"
                                    : "hover:text-white hover:bg-zinc-800/50"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-zinc-800">
                <button
                    onClick={() => {
                        localStorage.removeItem('auth_token');
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
