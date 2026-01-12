'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Package, Truck, Star } from 'lucide-react';

interface Addon {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    type: 'merch' | 'service' | 'parking';
}

interface AddonSelectionProps {
    eventSlug: string;
    onSelectionChange: (selections: Record<string, number>) => void;
    primaryColor?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function AddonSelection({ eventSlug, onSelectionChange, primaryColor }: AddonSelectionProps) {
    const [addons, setAddons] = useState<Addon[]>([]);
    const [selections, setSelections] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAddons = async () => {
            try {
                const res = await fetch(`${API_URL}/api/public/events/${eventSlug}/addons`);
                if (res.ok) {
                    const data = await res.json();
                    setAddons(data);
                }
            } catch (err) {
                console.error('Failed to fetch addons', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAddons();
    }, [eventSlug]);

    const updateQuantity = (id: string, delta: number) => {
        setSelections(prev => {
            const current = prev[id] || 0;
            const next = Math.max(0, current + delta);
            const addon = addons.find(a => a.id === id);

            if (addon && next > addon.stock) return prev;

            const newSelections = { ...prev, [id]: next };
            // Filter out zero quantities
            if (next === 0) delete newSelections[id];

            onSelectionChange(newSelections);
            return newSelections;
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'parking': return <Truck className="w-5 h-5" />;
            case 'service': return <Star className="w-5 h-5" />;
            default: return <Package className="w-5 h-5" />;
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading amazing add-ons...</div>;
    if (addons.length === 0) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enhance Your Experience</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Optional Add-ons</span>
            </div>

            <div className="grid gap-4">
                {addons.map((addon) => (
                    <Card key={addon.id} className="group overflow-hidden border-2 border-slate-100 hover:border-slate-950 transition-all duration-300 rounded-2xl shadow-sm hover:shadow-xl">
                        <CardContent className="p-0 flex items-stretch">
                            <div className="w-16 bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors">
                                {getIcon(addon.type)}
                            </div>
                            <div className="flex-1 p-5">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-900 text-lg">{addon.name}</h4>
                                    <span className="font-black text-slate-900">
                                        Rp {new Intl.NumberFormat('id-ID').format(addon.price)}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed mb-4">{addon.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                        {addon.stock} available
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                        <button
                                            onClick={() => updateQuantity(addon.id, -1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-950 transition-all active:scale-90"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-4 text-center font-black text-slate-900 tabular-nums">
                                            {selections[addon.id] || 0}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(addon.id, 1)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-950 transition-all active:scale-90"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
