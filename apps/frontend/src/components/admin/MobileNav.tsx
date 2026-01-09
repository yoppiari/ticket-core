"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, CalendarDays, Settings, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Events", url: "/admin/events", icon: CalendarDays },
    { title: "Team", url: "/admin/settings?tab=team", icon: Users },
    { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <div className="md:hidden flex items-center justify-between p-4 border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
                <Link href="/" className="font-bold text-lg">Tukutix</Link>
                <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Overlay Menu */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 pt-20 px-6 md:hidden">
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2">
                        <X className="h-6 w-6" />
                    </button>
                    <div className="space-y-4">
                        {items.map((item) => (
                            <Link
                                key={item.title}
                                href={item.url}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-lg text-lg font-medium border",
                                    pathname === item.url
                                        ? "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
                                        : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </Link>
                        ))}
                        <button
                            onClick={() => {
                                localStorage.removeItem('auth_token');
                                window.location.href = '/login';
                            }}
                            className="flex w-full items-center gap-4 px-4 py-3 rounded-lg text-lg font-medium text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
