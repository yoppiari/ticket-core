'use client';

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface ReservationTimerProps {
    expiresAt: string;
    onExpire: () => void;
}

export default function ReservationTimer({ expiresAt, onExpire }: ReservationTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(expiresAt) - +new Date();
            return difference > 0 ? Math.floor(difference / 1000) : 0;
        };

        const timer = setInterval(() => {
            const next = calculateTimeLeft();
            setTimeLeft(next);
            if (next <= 0) {
                clearInterval(timer);
                onExpire();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt, onExpire]);

    if (timeLeft <= 0) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-full font-mono text-sm font-bold shadow-sm">
            <Timer className="w-4 h-4 animate-pulse" />
            <span>
                {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
        </div>
    );
}
