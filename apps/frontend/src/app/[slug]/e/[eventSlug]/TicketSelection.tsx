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
    const [showBuyerForm, setShowBuyerForm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Buyer Details State
    const [buyerDetails, setBuyerDetails] = useState({
        name: '',
        whatsapp: '',
        email: '',
        delivery_method: 'email' // default
    });

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

    const handleCheckoutClick = () => {
        if (totalTickets === 0) return;
        setShowBuyerForm(true);
    };

    const submitCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCheckingOut(true);
        setError(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/events/${params.eventSlug}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    tickets: quantities,
                    buyer_name: buyerDetails.name,
                    buyer_whatsapp: buyerDetails.whatsapp,
                    buyer_email: buyerDetails.email,
                    delivery_method: buyerDetails.delivery_method
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
            setError(error instanceof Error ? error.message : 'Failed to start checkout');
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
            <div className={`fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 z-40 ${totalTickets > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
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
                        onClick={handleCheckoutClick}
                        disabled={isCheckingOut}
                    >
                        <span>Checkout</span>
                        <ShoppingCartIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Spacer for floating bar */}
            {totalTickets > 0 && <div className="h-24"></div>}

            {/* Buyer Details Modal */}
            {showBuyerForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Buyer Details</h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowBuyerForm(false)} className="rounded-full h-8 w-8 p-0">
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </Button>
                        </div>

                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={submitCheckout} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-bold text-slate-700">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    placeholder="Enter your full name"
                                    value={buyerDetails.name}
                                    onChange={e => setBuyerDetails({ ...buyerDetails, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="whatsapp" className="text-sm font-bold text-slate-700">WhatsApp Number</label>
                                <input
                                    id="whatsapp"
                                    type="tel"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    placeholder="e.g. 081234567890"
                                    value={buyerDetails.whatsapp}
                                    onChange={e => setBuyerDetails({ ...buyerDetails, whatsapp: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                                    placeholder="ticket@example.com"
                                    value={buyerDetails.email}
                                    onChange={e => setBuyerDetails({ ...buyerDetails, email: e.target.value })}
                                />
                                <p className="text-xs text-slate-400">E-tickets will be sent to this email.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" className="flex-1 rounded-xl font-bold" onClick={() => setShowBuyerForm(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-xl font-bold shadow-lg"
                                    style={{ backgroundColor: primaryColor }}
                                    disabled={isCheckingOut}
                                >
                                    {isCheckingOut ? 'Processing...' : 'Continue to Payment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
