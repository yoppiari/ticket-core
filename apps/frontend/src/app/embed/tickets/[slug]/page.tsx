"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface TicketType {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
}

interface Event {
    id: string;
    slug: string;
    name: string;
    start_date: string;
    venue_name: string;
    ticket_types: TicketType[];
    tenant: {
        slug: string;
    };
}

export default function TicketWidget() {
    const { slug } = useParams();
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: event, isLoading, error } = useQuery<Event>({
        queryKey: ["public-event", slug],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/public/events?filter[slug]=${slug}&include=ticketTypes,tenant`);
            if (!res.ok) throw new Error("Failed to load event");
            const json = await res.json();
            return json.data[0]; // Assuming API returns listing, we take first match
        },
    });

    // PostMessage Resizer Logic
    useEffect(() => {
        if (!containerRef.current) return;

        const sendHeight = () => {
            if (containerRef.current) {
                const height = containerRef.current.scrollHeight;
                window.parent.postMessage({ type: "ticket-widget-resize", height }, "*");
            }
        };

        const observer = new ResizeObserver(sendHeight);
        observer.observe(containerRef.current);

        // Initial send
        setTimeout(sendHeight, 500);

        return () => observer.disconnect();
    }, [event]);

    if (isLoading) return <div className="p-4 bg-zinc-50 text-center text-sm">Loading tickets...</div>;
    if (error || !event) return <div className="p-4 bg-red-50 text-center text-sm text-red-600">Event not found</div>;

    return (
        <div ref={containerRef} className="bg-white dark:bg-zinc-950 font-sans border dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm max-w-md mx-auto">
            <div className="p-4 bg-zinc-900 text-white">
                <h2 className="font-bold text-lg leading-tight">{event.name}</h2>
                <p className="text-zinc-400 text-xs mt-1">
                    {new Date(event.start_date).toLocaleDateString("id-ID", { dateStyle: 'long' })} &bull; {event.venue_name}
                </p>
            </div>

            <div className="divide-y dark:divide-zinc-800">
                {event.ticket_types.map((ticket) => (
                    <div key={ticket.id} className="p-4 flex justify-between items-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm">{ticket.name}</h3>
                            {ticket.description && <p className="text-zinc-500 text-xs mt-0.5">{ticket.description}</p>}
                            <div className="mt-1 font-mono text-zinc-900 dark:text-zinc-100 text-sm font-medium">
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(ticket.price)}
                            </div>
                        </div>

                        <a
                            href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/${event.tenant.slug}/e/${event.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`ml-3 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-colors
                ${ticket.stock > 0
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed"}`}
                        >
                            {ticket.stock > 0 ? "Buy" : "Sold Out"}
                        </a>
                    </div>
                ))}
            </div>

            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 text-center border-t dark:border-zinc-800">
                <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}`}
                    target="_blank"
                    className="text-[10px] text-zinc-400 uppercase tracking-widest hover:text-zinc-600"
                >
                    Powered by Tukutix
                </a>
            </div>
        </div>
    );
}
