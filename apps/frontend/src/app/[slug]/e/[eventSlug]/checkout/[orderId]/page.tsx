'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Ticket, Package, MapPin } from 'lucide-react';
import ReservationTimer from '@/components/cart/ReservationTimer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!params.eventSlug || !params.orderId) return;

        const fetchOrder = async () => {
            try {
                const res = await fetch(`${API_URL}/api/public/events/${params.eventSlug}/checkout/${params.orderId}`, {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Order not found or access denied');
                const data = await res.json();
                setOrder(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();

        // Polling for status updates
        const interval = setInterval(() => {
            if (isPaying) return; // Don't poll if we just clicked pay
            fetchOrder();
        }, 3000);

        return () => clearInterval(interval);
    }, [params.eventSlug, params.orderId]);

    useEffect(() => {
        if (order?.status === 'paid') {
            // Redirect or show success
            setIsPaying(false);
        }
    }, [order?.status]);

    const handlePay = async () => {
        setIsPaying(true);
        try {
            const res = await fetch(`${API_URL}/api/public/events/${params.eventSlug}/checkout/${params.orderId}/pay`, {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Redirect to payment gateway URL
                router.push(data.redirect_url);
            } else {
                alert(data.message || 'Payment initiation failed');
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setIsPaying(false);
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Order...</div>;
    if (error) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">{error}</div>;

    if (order.status === 'paid') {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-0 shadow-xl text-center p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-emerald-900 mb-2">Order Confirmed!</h1>
                    <p className="text-emerald-700 mb-8">Your tickets have been issued.</p>
                    <Button onClick={() => router.push('/')} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Back to Home
                    </Button>
                </Card>
            </div>
        );
    }

    const seats = order.items.filter((i: any) => i.item_type === 'seat');
    const tickets = order.items.filter((i: any) => i.item_type === 'ticket_type');
    const addons = order.items.filter((i: any) => i.item_type === 'addon');

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header - Brand Match with Event Page */}
                <div className="flex flex-col md:flex-row gap-6 relative overflow-hidden rounded-2xl bg-white border border-zinc-200 p-6 shadow-sm">
                    {/* Banner Thumbnail */}
                    {order.event?.banner_url && (
                        <div className="w-full md:w-48 h-32 relative rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={order.event.banner_url}
                                alt={order.event.name}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}

                    <div className="flex flex-col justify-center space-y-2">
                        {/* Tenant Name */}
                        {order.event?.tenant?.name && (
                            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                Organized by {order.event.tenant.name}
                            </div>
                        )}

                        {/* Event Name */}
                        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-none">
                            {order.event?.name || 'Event Checkout'}
                        </h1>

                        {/* Event Details */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-2">
                            {order.event?.start_date && (
                                <div className="flex items-start gap-2 text-sm text-zinc-600">
                                    <Clock className="w-4 h-4 mt-0.5 text-zinc-400 shrink-0" />
                                    <span className="font-medium">
                                        {new Date(order.event.start_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                        <br />
                                        <span className="text-zinc-500 font-normal">
                                            {new Date(order.event.start_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </span>
                                </div>
                            )}

                            {order.event?.venue_name && (
                                <div className="flex items-start gap-2 text-sm text-zinc-600">
                                    <MapPin className="w-4 h-4 mt-0.5 text-zinc-400 shrink-0" />
                                    <span className="font-medium">
                                        {order.event.venue_name}
                                        {order.event.venue_address && (
                                            <>
                                                <br />
                                                <span className="text-zinc-500 font-normal">{order.event.venue_address}</span>
                                            </>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Page Title */}
                <div className="flex items-center justify-between pt-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">Secure Checkout</h2>
                        <p className="text-zinc-500 text-sm">Complete your purchase</p>
                    </div>

                    {order.status === 'pending' && order.expires_at && (
                        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-zinc-200">
                            <ReservationTimer expiresAt={order.expires_at} onExpire={() => window.location.reload()} />
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Tickets Section */}
                        {(seats.length > 0 || tickets.length > 0) && (
                            <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
                                <CardHeader className="bg-zinc-900 text-white">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Ticket className="w-5 h-5" /> Tickets
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {/* General Tickets */}
                                    {tickets.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center group">
                                            <div>
                                                <div className="font-bold text-zinc-900">{item.details?.name}</div>
                                                <div className="text-sm text-zinc-500">Quantity: {item.quantity}</div>
                                            </div>
                                            <div className="font-mono font-medium text-zinc-900">
                                                Rp {new Intl.NumberFormat('id-ID').format(item.subtotal)}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Seat Tickets */}
                                    {seats.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center group">
                                            <div>
                                                <div className="font-bold text-zinc-900">{item.details?.label}</div>
                                                <div className="text-sm text-zinc-500">{item.details?.ticket_type?.name}</div>
                                            </div>
                                            <div className="font-mono font-medium text-zinc-900">
                                                Rp {new Intl.NumberFormat('id-ID').format(item.unit_price)}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Addons Section */}
                        {addons.length > 0 && (
                            <Card className="border-0 shadow-lg overflow-hidden rounded-2xl">
                                <CardHeader className="bg-zinc-100 border-b border-zinc-200">
                                    <CardTitle className="text-lg flex items-center gap-2 text-zinc-700">
                                        <Package className="w-5 h-5" /> Add-ons
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {addons.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-zinc-900">{item.details?.name}</div>
                                                <div className="text-sm text-zinc-500">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="font-mono font-medium text-zinc-900">
                                                Rp {new Intl.NumberFormat('id-ID').format(item.subtotal)}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-2 border-zinc-900 shadow-xl sticky top-4 rounded-2xl">
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-sm font-black text-zinc-400">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Subtotal</span>
                                    <span className="font-medium text-zinc-900">Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500">Fees</span>
                                    <span className="font-medium text-zinc-900">Rp 0</span>
                                </div>
                                <div className="h-px bg-zinc-200 w-full" />
                                <div className="flex justify-between items-end">
                                    <span className="font-black text-lg text-zinc-900">Total</span>
                                    <span className="font-black text-2xl text-zinc-900">
                                        Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full h-12 text-lg font-bold bg-zinc-900 hover:bg-zinc-800 rounded-xl"
                                    onClick={handlePay}
                                    disabled={isPaying}
                                >
                                    {isPaying ? 'Redirecting...' : 'Pay Now'}
                                </Button>
                            </CardFooter>
                        </Card>

                        <div className="text-center">
                            <p className="text-xs text-zinc-400">
                                Transaction ID: <span className="font-mono">{order.id.split('-')[0]}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
