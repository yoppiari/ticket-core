'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isPublic = pathname === '/affiliate/login' || pathname === '/affiliate/register';
    const [authorized, setAuthorized] = useState(isPublic);

    useEffect(() => {
        // Skip auth check for login and register pages if already authorized
        if (isPublic) {
            if (!authorized) setTimeout(() => setAuthorized(true), 0);
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/affiliate/login');
            return;
        }

        // Additional Security Check: Check Role
        try {
            const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
            if (userInfo.role && userInfo.role !== 'user') {
                // Wrong role for this portal
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_info');
                router.push('/affiliate/login');
                return;
            }
        } catch (e) {
            // malformed user info, force relogin
            localStorage.removeItem('auth_token');
            router.push('/affiliate/login');
            return;
        }

        if (!authorized) {
            setTimeout(() => setAuthorized(true), 0);
        }
    }, [pathname, router, authorized]);

    // Show loading or nothing while checking auth (except for public pages)
    if (!authorized && pathname !== '/affiliate/login' && pathname !== '/affiliate/register') {
        return null;
    }

    // Full screen layout for login/register
    if (pathname === '/affiliate/login' || pathname === '/affiliate/register') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col fixed inset-y-0 z-50">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-zinc-800">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Tukutix Partner
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link
                        href="/affiliate/dashboard"
                        className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/affiliate/dashboard'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/affiliate/marketplace"
                        className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === '/affiliate/marketplace'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        Marketplace
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
                    <button
                        onClick={() => {
                            localStorage.removeItem('auth_token');
                            router.push('/affiliate/login');
                        }}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 ml-64 min-w-0 bg-gray-50 dark:bg-gray-900">
                {/* Top Mobile Header could go here if needed, keeping it simple for now */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
