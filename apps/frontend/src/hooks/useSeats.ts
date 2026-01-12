'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function useSeats(eventSlug: string) {
    const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['seats', eventSlug],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/public/events/${eventSlug}/seats`);
            if (!res.ok) throw new Error('Failed to fetch seats');
            return res.json();
        },
        refetchInterval: 30000, // Refetch every 30s for availability changes
    });

    const toggleSeat = (seatId: string) => {
        setSelectedSeatId(prev => (prev === seatId ? null : seatId));
    };

    return {
        seats: data?.seats || [],
        layout: data?.layout,
        isLoading,
        error,
        selectedSeatId,
        toggleSeat,
        refetch
    };
}
