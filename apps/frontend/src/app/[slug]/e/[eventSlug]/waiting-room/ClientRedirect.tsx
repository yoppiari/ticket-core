
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendHeartbeat } from '@/lib/data';

export default function ClientRedirect({ eventSlug, targetUrl }: { eventSlug: string, targetUrl: string }) {
    const router = useRouter();

    useEffect(() => {
        // Heartbeat every 20 seconds
        const heartbeatInterval = setInterval(async () => {
            await sendHeartbeat(eventSlug);
        }, 20000);

        // Poll for admission every 5 seconds
        const pollInterval = setInterval(() => {
            router.refresh(); // This will trigger a re-fetch of the server component data
        }, 5000);

        return () => {
            clearInterval(heartbeatInterval);
            clearInterval(pollInterval);
        };
    }, [eventSlug, router]);

    return null;
}
