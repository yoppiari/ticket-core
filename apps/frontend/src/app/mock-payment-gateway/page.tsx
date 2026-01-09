'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

function MockPaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const orderId = searchParams.get('order_id');
    const amount = searchParams.get('amount');
    const ref = searchParams.get('ref');

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const res = await fetch(`${API_URL}/api/webhooks/payment/mock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    order_id: orderId,
                    status: 'paid',
                    token: 'valid-mock-token',
                }),
            });

            if (!res.ok) {
                throw new Error('Webhook failed');
            }

            // Simulate network delay for UX
            setTimeout(() => {
                setIsProcessing(false);
                setIsSuccess(true);
            }, 1000);
        } catch (error) {
            console.error('Payment simulation failed', error);
            setIsProcessing(false);
            alert('Payment simulation failed. Check console.');
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md border-0 shadow-xl text-center p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-emerald-900 mb-2">Payment Successful!</h1>
                    <p className="text-emerald-700 mb-8">Transaction {ref} has been approved.</p>
                    <div className="p-4 bg-emerald-100 rounded-lg mb-6">
                        <div className="text-sm text-emerald-800 font-medium">Amount Paid</div>
                        <div className="text-xl font-bold text-emerald-900">Rp {Number(amount).toLocaleString('id-ID')}</div>
                    </div>
                    <Button onClick={() => router.push('/')} className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Back to Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-0 shadow-xl">
                <CardHeader className="bg-slate-900 text-white p-6">
                    <CardTitle className="flex items-center gap-2">
                        <span>🔒 Validating Payment</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="text-center">
                        <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold mb-1">Total to Pay</div>
                        <div className="text-3xl font-black text-slate-900">
                            Rp {Number(amount).toLocaleString('id-ID')}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm py-2 border-b">
                            <span className="text-slate-500">Merchant</span>
                            <span className="font-medium">Tukutix Payments</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b">
                            <span className="text-slate-500">Order ID</span>
                            <span className="font-mono text-xs text-slate-900">{orderId}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b">
                            <span className="text-slate-500">Gateway Ref</span>
                            <span className="font-mono text-xs text-slate-900">{ref}</span>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button
                            className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700"
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing Transaction...' : 'Confirm Payment'}
                        </Button>
                        <Button variant="ghost" className="w-full text-slate-400 hover:text-red-500">
                            Cancel Transaction
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-slate-400 italic">This is a MOCK payment page for development.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function MockPaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MockPaymentContent />
        </Suspense>
    );
}
