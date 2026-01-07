
import { getPublicEvent, sendHeartbeat } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, TicketIcon, Share2Icon, BellIcon } from "lucide-react";
import Image from "next/image";
import TicketSelection from "./TicketSelection";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string, eventSlug: string }> }): Promise<Metadata> {
    const { slug, eventSlug } = await params;
    const data = await getPublicEvent(slug, eventSlug);
    if (!data) return { title: 'Event Not Found' };
    return {
        title: `${data.event.name} | ${data.tenant.name}`,
        description: data.event.description || `Get your tickets for ${data.event.name} now!`,
    };
}

export default async function EventLandingPage({ params }: { params: Promise<{ slug: string, eventSlug: string }> }) {
    const { slug, eventSlug } = await params;
    const data = await getPublicEvent(slug, eventSlug);

    if (!data) {
        return notFound();
    }

    if (data.isQueued) {
        redirect(`/${slug}/e/${eventSlug}/waiting-room`);
    }

    const { tenant, event } = data;

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            {/* Header / Nav */}
            <header
                className="py-4 px-6 text-white shadow-md sticky top-0 z-10"
                style={{ backgroundColor: tenant.branding?.primary_color || '#3b82f6' }}
            >
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl uppercase tracking-wider">{tenant.name}</div>
                    <div className="text-sm opacity-90">Official Ticketing Platform</div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-white border-b relative overflow-hidden">
                {/* Banner Image */}
                {event.banner_url && (
                    <div className="w-full h-[400px] relative">
                        <Image
                            src={event.banner_url}
                            alt={event.name}
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
                    </div>
                )}

                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full opacity-5 pointer-events-none" style={{ backgroundColor: tenant.branding?.primary_color }}></div>
                <div className="max-w-4xl mx-auto px-6 relative z-1 py-12">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <Badge variant="outline" className="font-mono uppercase tracking-widest text-[10px] py-1 px-3" style={{ color: tenant.branding?.primary_color, borderColor: tenant.branding?.primary_color }}>
                            {event.status === 'draft' ? 'Advance Access' : 'Featured Event'}
                        </Badge>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-bold uppercase text-[10px] tracking-wider py-1 px-3">
                            Selling Fast
                        </Badge>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-zinc-900 mb-8 leading-[1.1] tracking-tight">
                        {event.name}
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-zinc-100 rounded-2xl">
                                    <CalendarIcon className="w-6 h-6 text-zinc-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">When</div>
                                    <div className="text-xl font-black text-zinc-900 leading-tight">
                                        {new Date(event.start_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <div className="text-sm text-zinc-500 mt-1 font-medium">
                                        Doors open at {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-zinc-100 rounded-2xl">
                                    <MapPinIcon className="w-6 h-6 text-zinc-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-zinc-500 font-bold uppercase tracking-wider mb-1">Where</div>
                                    <div className="text-xl font-black text-zinc-900 leading-tight">
                                        {event.venue_name}
                                    </div>
                                    <div className="text-sm text-zinc-500 mt-1 font-medium">
                                        {event.venue_address || 'Check back for exact location details'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 md:justify-end">
                            <Button variant="outline" size="lg" className="rounded-2xl border-2 font-bold gap-2 text-zinc-700 border-zinc-200">
                                <Share2Icon className="w-4 h-4" /> Share
                            </Button>
                            <Button variant="outline" size="lg" className="rounded-2xl border-2 font-bold gap-2 text-zinc-700 border-zinc-200">
                                <BellIcon className="w-4 h-4" /> Remind Me
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets & Content */}
            <main className="max-w-7xl mx-auto px-6 -mt-12 mb-24 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                {/* Left column: Ticket Selection */}
                <div className="lg:col-span-2 space-y-12">


                    <TicketSelection
                        tickets={event.ticket_types}
                        primaryColor={tenant.branding?.primary_color}
                    />
                </div>

                {/* Right column: Info & Sidebar */}
                <div className="space-y-8">
                    <Card className="rounded-2xl border-zinc-200 shadow-xl overflow-hidden">
                        <CardHeader className="bg-zinc-50 border-b p-8">
                            <CardTitle className="text-lg font-black uppercase tracking-tight text-zinc-900">Terms & Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4 text-zinc-600 text-sm leading-relaxed">
                            <p>All sales are final. No refunds or exchanges except as provided in the Event Organizer&apos;s policy.</p>
                            <p>Please ensure you enter your email correctly. E-tickets will be sent to the email provided during checkout.</p>
                            <div className="pt-4 border-t border-zinc-200">
                                <div className="text-[11px] font-black uppercase text-zinc-400 tracking-wider mb-2">Organizer</div>
                                <div className="text-zinc-900 font-bold">{tenant.name}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shared CTA or Footer in Sidebar */}
                    <div className="p-8 bg-zinc-900 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <h3 className="text-xl font-black mb-4 relative z-1 tracking-tight italic">TICKET WAR!</h3>
                        <p className="text-zinc-400 text-sm mb-6 relative z-1 leading-relaxed">
                            Ready for the ultimate high-speed checkout experience?
                        </p>
                        <Badge className="bg-white/10 text-white font-mono text-[10px]">v1.0 Ready</Badge>
                    </div>
                </div>

            </main>

            <footer className="p-8 border-t mt-auto text-center text-zinc-400 text-xs font-medium uppercase tracking-widest border-zinc-200">
                &copy; 2026 Ticketing Platform. Empowered by ANTIGRAVITY.
            </footer>
        </div>
    );
}
