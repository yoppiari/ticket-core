'use client';

import { useState, useEffect } from 'react';

// Basic user interface based on typical usage
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    tenant_id: string | null;
    tenant_slug?: string; // Optional helper
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage or fetch /api/me
        // For this immediate fix, we'll try to get from localStorage first to unblock render
        // But ideally we hit the API.

        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    // Invalid token
                    localStorage.removeItem('auth_token');
                }
            } catch (error) {
                console.error('Auth check failed', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading };
}
