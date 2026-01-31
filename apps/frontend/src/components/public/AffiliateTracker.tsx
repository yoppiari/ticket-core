'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AffiliateTracker() {
    const searchParams = useSearchParams();
    const trackedRef = useRef(false);

    useEffect(() => {
        const refCode = searchParams.get('ref');

        if (refCode && !trackedRef.current) {
            trackedRef.current = true;

            // 1. Store locally for checkout usage
            localStorage.setItem('affiliate_ref', refCode);

            // 2. Set Cookie (redundancy) - 30 days
            const date = new Date();
            date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
            document.cookie = `affiliate_ref=${refCode}; expires=${date.toUTCString()}; path=/`;

            // 3. Send to Backend
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/affiliates/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ ref: refCode }),
            }).catch(console.error);
        }
    }, [searchParams]);

    return null;
}
