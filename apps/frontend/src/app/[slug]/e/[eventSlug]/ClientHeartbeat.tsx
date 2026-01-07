
'use client';

import { useEffect } from 'react';
import { sendHeartbeat } from '@/lib/data';

export default function ClientHeartbeat({ eventSlug }: { eventSlug: string }) {
    useEffect(() => {
        // Heartbeat every 20 seconds to keep the slot active
        const interval = setInterval(async () => {
            await sendHeartbeat(eventSlug);
        }, 20000);

        return () => clearInterval(interval);
    }, [eventSlug]);

    return null;
}
