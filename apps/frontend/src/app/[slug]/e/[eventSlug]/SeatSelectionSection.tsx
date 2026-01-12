'use client';

import React, { useState } from 'react';
import SeatMap from '@/components/spatial/SeatMap';
import { useSeats } from '@/hooks/useSeats';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ReservationTimer from '@/components/cart/ReservationTimer';
import { toast } from 'sonner';

import AddonSelection from '@/components/purchase/AddonSelection';


import { useRouter } from 'next/navigation';

interface SeatSelectionSectionProps {
    eventSlug: string;
    primaryColor?: string;
    slug: string; // Need slug for routing
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function SeatSelectionSection({ slug, eventSlug, primaryColor }: SeatSelectionSectionProps) {
    const router = useRouter();
    const { seats, isLoading, error, selectedSeatId, toggleSeat, refetch } = useSeats(eventSlug);
    const [reservation, setReservation] = useState<{ expires_at: string } | null>(null);
    const [isReserving, setIsReserving] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showAddons, setShowAddons] = useState(false);
    const [addonSelections, setAddonSelections] = useState<Record<string, number>>({});

    const handleReserve = async () => {
        if (!selectedSeatId) return;
        setIsReserving(true);
        try {
            const res = await fetch(`${API_URL}/api/public/events/${eventSlug}/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seat_ids: [selectedSeatId] }),
            });
            const data = await res.json();
            if (res.ok) {
                setReservation(data);
                toast.success('Seat reserved successfully!');
                refetch();
            } else {
                toast.error(data.message || 'Failed to reserve seat');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setIsReserving(false);
        }
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            const res = await fetch(`${API_URL}/api/public/events/${eventSlug}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seat_ids: [selectedSeatId],
                    addons: addonSelections
                }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Redirect to checkout page
                router.push(`/${slug}/e/${eventSlug}/checkout/${data.order_id}`);
            } else {
                toast.error(data.message || 'Checkout failed');
            }
        } catch (err) {
            toast.error('Network error during checkout');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {showAddons ? 'Complete Your Bundle' : 'Select Your Seat'}
                    </h2>
                </div>
                {reservation && (
                    <ReservationTimer
                        expiresAt={reservation.expires_at}
                        onExpire={() => {
                            setReservation(null);
                            setShowAddons(false);
                            toast.error('Reservation expired');
                            refetch();
                        }}
                    />
                )}
                {!showAddons && (
                    <div className="hidden md:flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#1e293b] border border-slate-700"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reserved</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor || '#3b82f6' }}></div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected</span>
                        </div>
                    </div>
                )}
            </div>

            {!showAddons ? (
                <div className="bg-slate-900 p-1 rounded-3xl overflow-hidden shadow-inner border border-white/5 animate-in fade-in zoom-in-95 duration-500">
                    <SeatMap
                        seats={seats}
                        onSeatSelect={toggleSeat}
                        primaryColor={primaryColor}
                    />
                </div>
            ) : (
                <AddonSelection
                    eventSlug={eventSlug}
                    onSelectionChange={setAddonSelections}
                    primaryColor={primaryColor}
                />
            )}

            {selectedSeatId && (
                <Card className="bg-white border-2 border-slate-900 rounded-2xl shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <div className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">
                                {reservation ? 'Reserved Seat' : 'Selected Seat'}
                            </div>
                            <div className="text-2xl font-black text-slate-900">
                                {seats.find((s: any) => s.id === selectedSeatId)?.label}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {!reservation ? (
                                <Button
                                    onClick={handleReserve}
                                    disabled={isReserving}
                                    className="px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-xs"
                                    style={{ backgroundColor: primaryColor || '#3b82f6' }}
                                >
                                    {isReserving ? 'Reserving...' : 'Reserve Now'}
                                </Button>
                            ) : !showAddons ? (
                                <Button
                                    onClick={() => setShowAddons(true)}
                                    className="px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-xs bg-slate-900 hover:bg-slate-800"
                                >
                                    Proceed to Add-ons
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="px-8 h-12 rounded-xl font-bold uppercase tracking-widest text-xs bg-emerald-600 hover:bg-emerald-700"
                                >
                                    {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
