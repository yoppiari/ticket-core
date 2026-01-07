'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TicketIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface TicketType {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    sale_start_date: string | null;
    sale_end_date: string | null;
    image_url?: string;
}

interface TicketSelectionProps {
    tickets: TicketType[];
    primaryColor?: string;
}

export default function TicketSelection({ tickets, primaryColor = '#3b82f6' }: TicketSelectionProps) {
    const params = useParams();
    const router = useRouter();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const updateQuantity = (ticketId: string, delta: number, max: number) => {
        setQuantities(prev => {
            const current = prev[ticketId] || 0;
            const next = Math.max(0, Math.min(max, current + delta));
            return { ...prev, [ticketId]: next };
        });
    };

    const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
    const totalPrice = tickets.reduce((total, ticket) => {
        return total + (ticket.price * (quantities[ticket.id] || 0));
    }, 0);

    const handleCheckout = async () => {
        if (totalTickets === 0) return;
        setIsCheckingOut(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/public/events/${params.eventSlug}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    tickets: quantities,
                }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Checkout failed');
            }

            if (data.order_id) {
                router.push(`/${params.slug}/e/${params.eventSlug}/checkout/${data.order_id}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert(error instanceof Error ? error.message : 'Failed to start checkout');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="space-y-8">
            <div id="ticket-selection" className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <TicketIcon className="w-5 h-5 text-slate-400" />
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Select Ticket Type</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {tickets && tickets.length > 0 ? (
                        tickets.map((ticket) => {
                            const isAvailable = !ticket.sale_start_date || new Date(ticket.sale_start_date) <= new Date();
                            const hasStarted = !ticket.sale_start_date || new Date(ticket.sale_start_date) <= new Date();
                            const hasEnded = ticket.sale_end_date && new Date(ticket.sale_end_date) < new Date();

                            let statusText = "Available";
                            let isDisabled = false;

                            if (!hasStarted) {
                                statusText = "Coming Soon";
                                isDisabled = true;
                            } else if (hasEnded) {
                                statusText = "Expired";
                                isDisabled = true;
                            } else if (ticket.stock <= 0) {
                                statusText = "Sold Out";
                                isDisabled = true;
                            }

                            const currentQty = quantities[ticket.id] || 0;

                            return (
                                <div key={ticket.id} className={`group relative bg-white border rounded-3xl p-6 transition-all hover:shadow-xl ${isDisabled ? 'opacity-60 saturate-50' : 'hover:border-slate-300'}`}>
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {ticket.image_url && (
                                            <div className="w-full md:w-32 h-32 relative rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-slate-100">
                                                <Image
                                                    src={ticket.image_url}
                                                    alt={ticket.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    unoptimized
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{ticket.name}</h3>
                                                    {isDisabled && <Badge variant="secondary" className="text-[10px] uppercase font-bold">{statusText}</Badge>}
                                                </div>
                                                <p className="text-slate-500 text-sm mb-4 leading-relaxed max-w-md">
                                                    {ticket.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    {!isDisabled && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                            <span>{ticket.stock} Tickets Left</span>
                                                        </div>
                                                    )}
                                                    {ticket.sale_start_date && !hasStarted && (
                                                        <span className="text-amber-600">Sale starts {new Date(ticket.sale_start_date).toLocaleString()}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 min-w-[140px]">
                                                <div className="text-2xl font-black text-slate-900 tracking-tighter">
                                                    {Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ticket.price)}
                                                </div>

                                                {!isDisabled ? (
                                                    <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
                                                            onClick={() => updateQuantity(ticket.id, -1, ticket.stock)}
                                                            disabled={currentQty === 0}
                                                        >
                                                            <MinusIcon className="w-4 h-4" />
                                                        </Button>
                                                        <span className="text-lg font-bold w-6 text-center">{currentQty}</span>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 rounded-lg hover:bg-white hover:shadow-sm"
                                                            onClick={() => updateQuantity(ticket.id, 1, ticket.stock)}
                                                            disabled={currentQty >= ticket.stock}
                                                        >
                                                            <PlusIcon className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button disabled variant="outline" className="w-full opacity-50 font-bold uppercase text-[10px] tracking-widest">
                                                        {statusText}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                            <div className="text-slate-400 font-medium italic">No tickets available</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Checkbar / Floating Action */}
            <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 z-50 ${totalTickets > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Payment</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                            {Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalPrice)}
                        </div>
                    </div>
                    <Button
                        size="lg"
                        className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all gap-2"
                        style={{ backgroundColor: primaryColor }}
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                    >
                        {isCheckingOut ? (
                            <span>Processing...</span>
                        ) : (
                            <>
                                <span>Checkout</span>
                                <ShoppingCartIcon className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
            {/* Spacer for floating bar */}
            {totalTickets > 0 && <div className="h-24"></div>}
        </div>
    );
}
