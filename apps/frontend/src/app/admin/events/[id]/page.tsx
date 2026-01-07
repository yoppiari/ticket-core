"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PricingTierManager from "@/components/admin/PricingTierManager";

export default function EditEventPage() {
    const { id } = useParams();
    const router = useRouter();

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            router.push("/login");
            return;
        }

        fetchEvent(token);
    }, [id]);

    const fetchEvent = async (token: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/admin/events/${id}?include=ticketTypes,ticketTypes.pricingTiers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setEvent(data.data); // Assuming Laravel Resource returns wrapped data
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10">Loading...</div>;
    if (!event) return <div className="p-10">Event not found</div>;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
            <header className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 mb-8">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/events" className="font-medium text-zinc-600 hover:text-black">
                            &larr; Back to Events
                        </Link>
                        <span className="font-bold text-xl">{event.name}</span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4">
                <section className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm mb-6">
                    <h2 className="text-lg font-bold mb-4">Event Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-zinc-500">Venue</span>
                            <span>{event.venue_name}</span>
                        </div>
                        <div>
                            <span className="block text-zinc-500">Dates</span>
                            <span>{new Date(event.start_date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm">
                    <h2 className="text-lg font-bold mb-4">Ticket Types & Pricing</h2>
                    <div className="space-y-6">
                        {event.ticket_types?.map((tt: any) => (
                            <div key={tt.id} className="border-b pb-6 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold">{tt.name}</h3>
                                        <p className="text-sm text-zinc-500">Base Price: {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(tt.price)}</p>
                                    </div>
                                    <span className="text-xs bg-zinc-100 px-2 py-1 rounded">Stock: {tt.stock}</span>
                                </div>

                                <PricingTierManager ticketType={tt} />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-8">
                    <h2 className="text-lg font-bold mb-4">Embeddable Widgets</h2>
                    <div className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        {`<!-- Ticket Widget -->`}
                        <br />
                        {`<iframe src="${window.location.protocol}//${window.location.host}/embed/tickets/${event.slug}" width="100%" height="600"></iframe>`}
                        <br /><br />
                        {`<!-- Leaderboard Widget (Create a leaderboard first) -->`}
                        <br />
                        {`<iframe src="${window.location.protocol}//${window.location.host}/embed/leaderboard/LEADERBOARD_ID" width="100%" height="400"></iframe>`}
                    </div>
                </section>
            </main>
        </div>
    );
}
