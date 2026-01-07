'use client';

import { useEffect, useState } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Ticket, Package } from 'lucide-react';
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
                const res = await fetch(`${API_URL}/api/public/events/${params.eventSlug}/checkout/${params.orderId}`);
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
    const addons = order.items.filter((i: any) => i.item_type === 'addon');

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
                        <p className="text-slate-500">Review your order before payment</p>
                    </div>

                    {order.status === 'pending' && order.expires_at && (
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                            <ReservationTimer expiresAt={order.expires_at} onExpire={() => window.location.reload()} />
                        </div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Order Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Ticket className="w-5 h-5" /> Tickets
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {seats.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center group">
                                        <div>
                                            <div className="font-bold text-slate-900">{item.details?.label}</div>
                                            <div className="text-sm text-slate-500">{item.details?.ticket_type?.name}</div>
                                        </div>
                                        <div className="font-mono font-medium">
                                            Rp {new Intl.NumberFormat('id-ID').format(item.unit_price)}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {addons.length > 0 && (
                            <Card className="border-0 shadow-lg overflow-hidden">
                                <CardHeader className="bg-slate-100 border-b border-slate-200">
                                    <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                                        <Package className="w-5 h-5" /> Add-ons
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {addons.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-slate-900">{item.details?.name}</div>
                                                <div className="text-sm text-slate-500">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="font-mono font-medium">
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
                        <Card className="border-2 border-slate-900 shadow-xl sticky top-4">
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-sm font-black text-slate-400">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-medium">Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Fees</span>
                                    <span className="font-medium">Rp 0</span>
                                </div>
                                <div className="h-px bg-slate-200 w-full" />
                                <div className="flex justify-between items-end">
                                    <span className="font-black text-lg text-slate-900">Total</span>
                                    <span className="font-black text-2xl text-slate-900">
                                        Rp {new Intl.NumberFormat('id-ID').format(order.total_amount)}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800"
                                    onClick={handlePay}
                                    disabled={isPaying}
                                >
                                    {isPaying ? 'Redirecting...' : 'Pay Now'}
                                </Button>
                            </CardFooter>
                        </Card>

                        <div className="text-center">
                            <p className="text-xs text-slate-400">
                                Transaction ID: <span className="font-mono">{order.id.split('-')[0]}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
