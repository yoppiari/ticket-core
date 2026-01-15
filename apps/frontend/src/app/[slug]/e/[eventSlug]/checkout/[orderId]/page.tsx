'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2Icon, Loader2Icon, QrCodeIcon, ClockIcon, AlertCircleIcon, ArrowLeftIcon } from 'lucide-react';
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";

// Helper to fetch order
async function getOrder(eventSlug: string, orderId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/events/${eventSlug}/checkout/${orderId}`, {
        headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to load order');
    return res.json();
}

async function payOrder(eventSlug: string, orderId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/events/${eventSlug}/checkout/${orderId}/pay`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({})
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Payment initiation failed');
    return data;
}

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const eventSlug = params.eventSlug as string;
    const orderId = params.orderId as string;
    const slug = params.slug as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Payment State
    const [isPaying, setIsPaying] = useState(false);
    const [qrString, setQrString] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Polling Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        const fetchOrder = async () => {
            try {
                const data = await getOrder(eventSlug, orderId);
                setOrder(data.order);
                setLastUpdated(new Date());

                // If Paid, stop polling? No, maybe we want to see updates. But logic usually stops.
                if (data.order.status === 'paid') {
                    // Success!
                }
            } catch (err) {
                console.error(err);
                if (!order) setError('Order not found');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Poll every 5 seconds if pending and (qrString is present OR we just want to watch status)
        if (!order || order.status === 'pending') {
            interval = setInterval(fetchOrder, 5000);
        }

        return () => clearInterval(interval);
    }, [eventSlug, orderId, order?.status]); // Dependency on status to stop polling if needed

    const handlePay = async () => {
        setIsPaying(true);
        try {
            const res = await payOrder(eventSlug, orderId);

            // Check for QR String in deeply nested data
            // Structure: { success: true, data: { qr_string: "...", ... } }
            if (res.data && res.data.qr_string) {
                setQrString(res.data.qr_string);
            } else if (res.redirect_url) {
                // Fallback for other gateways
                window.location.href = res.redirect_url;
            } else {
                throw new Error("No payment info received");
            }

        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsPaying(false);
        }
    };

    if (loading && !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <Loader2Icon className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4 text-center">
                <AlertCircleIcon className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-xl font-bold text-zinc-900 mb-2">Order Not Found</h1>
                <p className="text-zinc-500 mb-6">We could not find the order you are looking for.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const { tenant } = order.event || { tenant: { name: 'Tukutix', branding: { primary_color: '#000' } } }; // Fallback
    const branding = tenant?.branding || { primary_color: '#000' };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
            {/* Simplified Header */}
            <header className="bg-white border-b py-4 px-6 md:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="font-black text-xl tracking-tighter uppercase">{tenant?.name || 'Tukutix'}</div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-12">
                <div className="mb-8">
                    <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => router.push(`/${slug}/e/${eventSlug}`)}>
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Event
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mt-4 tracking-tight">Checkout</h1>
                    <p className="text-zinc-500">Order ID: <span className="font-mono font-bold text-zinc-700">{order.order_number}</span></p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Payment Action */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-3xl border-0 shadow-xl overflow-hidden">
                            <div className="h-2 w-full" style={{ backgroundColor: branding.primary_color }}></div>
                            <CardHeader className="bg-white border-b p-8">
                                <CardTitle className="flex items-center gap-3 text-2xl font-black text-zinc-900">
                                    {order.status === 'paid' ? (
                                        <>
                                            <CheckCircle2Icon className="w-8 h-8 text-green-500" />
                                            Payment Successful
                                        </>
                                    ) : (
                                        <>
                                            <QrCodeIcon className="w-8 h-8 text-zinc-900" />
                                            Payment Required
                                        </>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 bg-zinc-50/50 min-h-[400px] flex flex-col items-center justify-center text-center">

                                {order.status === 'paid' ? (
                                    <div className="space-y-6 animate-in zoom-in duration-300">
                                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle2Icon className="w-12 h-12 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Tickets Sent!</h3>
                                            <p className="text-zinc-500 max-w-md mx-auto">
                                                Thank you for your purchase. E-tickets have been sent to <strong>{order.customer_email}</strong>.
                                            </p>
                                        </div>
                                        <Button className="mt-4 rounded-xl font-bold" onClick={() => window.print()}>
                                            Print Receipt
                                        </Button>
                                    </div>
                                ) : (
                                    /* Pending State */
                                    <div className="w-full max-w-sm space-y-8">
                                        {qrString ? (
                                            <div className="space-y-6">
                                                <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 inline-block relative group">
                                                    <Image
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`}
                                                        width={300}
                                                        height={300}
                                                        alt="Scan QRIS"
                                                        className="group-hover:scale-105 transition-transform duration-500"
                                                        unoptimized
                                                    />
                                                    <div className="absolute inset-x-0 bottom-4 text-center">
                                                        <Badge variant="secondary" className="bg-white/90 backdrop-blur shadow-sm text-xs font-bold text-zinc-900">
                                                            SCAN WITH ANY QRIS APP
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="text-center space-y-2">
                                                    <div className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Expires in</div>
                                                    <div className="text-3xl font-black font-mono text-amber-600 tabular-nums">15:00</div>
                                                    <p className="text-xs text-zinc-400">Please complete payment before timer ends</p>
                                                </div>

                                                <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl font-medium">
                                                    Waiting for payment confirmation...
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <p className="text-zinc-600 text-lg">
                                                    Please proceed to payment to secure your tickets.
                                                    <br />Tickets are reserved for <strong>15 minutes</strong>.
                                                </p>
                                                <Button
                                                    size="lg"
                                                    className="w-full h-16 text-lg rounded-2xl font-black uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
                                                    style={{ backgroundColor: branding.primary_color }}
                                                    onClick={handlePay}
                                                    disabled={isPaying}
                                                >
                                                    {isPaying ? (
                                                        <>
                                                            <Loader2Icon className="w-5 h-5 mr-3 animate-spin" />
                                                            Generating QR...
                                                        </>
                                                    ) : (
                                                        <>Pay with QRIS</>
                                                    )}
                                                </Button>
                                                <div className="flex items-center justify-center gap-4 grayscale opacity-50">
                                                    {/* Payment Logos Placeholder */}
                                                    <div className="h-6 w-12 bg-zinc-200 rounded"></div>
                                                    <div className="h-6 w-12 bg-zinc-200 rounded"></div>
                                                    <div className="h-6 w-12 bg-zinc-200 rounded"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Summary */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border-zinc-200 shadow-lg bg-zinc-900 text-white overflow-hidden">
                            <CardHeader className="border-b border-white/10 p-6">
                                <CardTitle className="text-lg font-black uppercase tracking-wider">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    {(order.items || []).map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-start text-sm">
                                            <div>
                                                <div className="font-bold text-white">{item.ticket_type?.name || 'Ticket'}</div>
                                                <div className="text-zinc-400 text-xs">x{item.quantity}</div>
                                            </div>
                                            <div className="font-mono text-zinc-300">
                                                {Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-white/10 pt-4">
                                    <div className="flex justify-between items-end">
                                        <div className="text-zinc-400 text-xs uppercase font-bold tracking-widest">Total Amount</div>
                                        <div className="text-3xl font-black tracking-tight">
                                            {Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(order.total_amount)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-white/5 p-4 text-[10px] text-zinc-500 text-center justify-center">
                                Encrypted & Secure Payment
                            </CardFooter>
                        </Card>

                        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Buyer Details</div>
                            <div className="font-bold text-zinc-900 text-lg">{order.customer_name}</div>
                            <div className="text-zinc-500">{order.customer_email}</div>
                            <div className="text-zinc-500">{order.customer_phone}</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
