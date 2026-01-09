"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CalendarDays,
    Settings,
    Users,
    LogOut,
    Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Events",
        url: "/admin/events",
        icon: CalendarDays,
    },
    {
        title: "Team",
        url: "/admin/settings?tab=team", // Deep link to team tab
        icon: Users,
    },
    {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
    },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <div className={cn("flex flex-col h-screen border-r bg-white dark:bg-zinc-950 dark:border-zinc-800", className)}>
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Ticket className="h-6 w-6 text-blue-600" />
                    <span>Tukutix</span>
                </Link>
            </div>

            <div className="flex-1 px-4 space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.url || (item.url !== '/admin/dashboard' && pathname.startsWith(item.url));

                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-900"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t dark:border-zinc-800">
                <button
                    onClick={() => {
                        localStorage.removeItem('auth_token');
                        window.location.href = '/login';
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
