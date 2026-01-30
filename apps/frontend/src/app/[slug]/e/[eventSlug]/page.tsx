import { getPublicEvent, sendHeartbeat } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, TicketIcon, Share2Icon, BellIcon, ExternalLinkIcon, InstagramIcon, GlobeIcon } from "lucide-react";
import Image from "next/image";
import TicketSelection from "./TicketSelection";
import { Metadata } from 'next';
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import ShareButton from "@/components/public/ShareButton";
import RemindMeButton from "@/components/public/RemindMeButton";

// Allow dynamic params at runtime
export const dynamic = 'force-dynamic';

// Allow dynamic params at runtime for static export
export async function generateStaticParams() {
    // Return empty array to allow any dynamic param at runtime
    return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string, eventSlug: string }> }): Promise<Metadata> {
    try {
        const { slug, eventSlug } = await params;
        const data = await getPublicEvent(slug, eventSlug);

        if (!data || !data.event || !data.tenant) {
            return {
                title: 'Event Not Found',
                description: 'The requested event could not be found.'
            };
        }

        const eventBanner = data.event.banner_url || '';
        const eventDescription = data.event.description || `Get your tickets for ${data.event.name} now!`;
        // Use a fallback for APP_URL that is safe
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tukutix.com';
        const eventUrl = `${appUrl}/${slug}/e/${eventSlug}`;

        return {
            title: `${data.event.name} | ${data.tenant.name}`,
            description: eventDescription,
            openGraph: {
                title: data.event.name,
                description: eventDescription,
                url: eventUrl,
                siteName: 'Tukutix',
                images: eventBanner ? [
                    {
                        url: eventBanner,
                        width: 1200,
                        height: 630,
                        alt: data.event.name,
                    },
                ] : [],
                type: 'website',
                locale: 'id_ID',
            },
            twitter: {
                card: 'summary_large_image',
                title: data.event.name,
                description: eventDescription,
                images: eventBanner ? [eventBanner] : [],
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Tukutix Event',
            description: 'Event details'
        };
    }
}

export default async function EventLandingPage({ params, searchParams }: { params: Promise<{ slug: string, eventSlug: string }>, searchParams: Promise<Record<string, string>> }) {
    const { slug, eventSlug } = await params;
    const query = await searchParams; // Await searchParams in Next.js 15
    const data = await getPublicEvent(slug, eventSlug, query);

    if (!data || !data.tenant || !data.event) {
        return notFound();
    }

    if (data.isQueued) {
        redirect(`/${slug}/e/${eventSlug}/waiting-room`);
    }

    const { tenant, event } = data;

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header / Nav */}
            <TenantHeader tenant={{ name: tenant.name, slug, branding: tenant.branding }} />

            {/* Hero Section */}
            <div className="bg-white relative overflow-hidden">
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
                                    {event.latitude && event.longitude ? (
                                        <div className="mt-2">
                                            <div className="text-sm text-zinc-500 font-medium mb-2">
                                                {event.venue_address}
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-lg transition-colors group"
                                            >
                                                <MapPinIcon className="w-4 h-4" />
                                                Open in Google Maps
                                                <ExternalLinkIcon className="w-3 h-3 ml-0.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-zinc-500 mt-1 font-medium">
                                            {event.venue_address || 'Check back for exact location details'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 md:justify-end">
                            <ShareButton
                                eventName={event.name}
                                eventDescription={event.description}
                                className="rounded-2xl border-2 font-bold gap-2 text-zinc-700 border-zinc-200"
                            />
                            <RemindMeButton
                                tenantSlug={slug}
                                eventSlug={eventSlug}
                                className="rounded-2xl border-2 font-bold gap-2 text-zinc-700 border-zinc-200"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets & Content */}
            <main className="max-w-7xl mx-auto px-6 py-12 mb-24 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                {/* Left column: Content & Tickets */}
                <div className="lg:col-span-2 space-y-12">
                    <TicketSelection
                        tickets={event.ticket_types}
                        primaryColor={tenant.branding?.primary_color}
                    />

                    {/* Description */}
                    {event.description && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-zinc-900">About this Event</h2>
                            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600" dangerouslySetInnerHTML={{ __html: event.description }} />
                        </div>
                    )}

                    {/* Facilities */}
                    {event.facilities && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-zinc-900">Facilities</h2>
                            <div className="flex flex-wrap gap-2">
                                {event.facilities.split(',').map((facility: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200">
                                        {facility.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column: Info & Sidebar */}
                <div className="space-y-8">
                    <Card className="rounded-2xl border-zinc-200 shadow-xl overflow-hidden">
                        <CardHeader className="bg-white border-b border-zinc-200 px-6 py-4">
                            <CardTitle className="text-lg font-black uppercase tracking-tight text-zinc-900">Terms & Conditions</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4 text-zinc-600 text-sm leading-relaxed">
                            {event.terms_and_conditions ? (
                                <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none text-zinc-600" dangerouslySetInnerHTML={{ __html: event.terms_and_conditions }} />
                            ) : (
                                <>
                                    <p>All sales are final. No refunds or exchanges except as provided in the Event Organizer&apos;s policy.</p>
                                    <p>Please ensure you enter your email correctly. E-tickets will be sent to the email provided during checkout.</p>
                                </>
                            )}
                            <div className="pt-4 border-t border-zinc-200">
                                <div className="text-[11px] font-black uppercase text-zinc-400 tracking-wider mb-3">Organizer</div>
                                <div className="text-zinc-900 font-bold text-base">{tenant.name}</div>
                                <div className="flex items-center gap-3 mt-3">
                                    <Link href={`/${tenant.slug}`} className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold hover:underline">
                                        View Profile &rarr;
                                    </Link>
                                    {event.social_media?.instagram && (
                                        <a href={event.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-600 transition-colors">
                                            <InstagramIcon className="w-5 h-5" />
                                        </a>
                                    )}
                                    {event.social_media?.website && (
                                        <a href={event.social_media.website} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-600 transition-colors">
                                            <GlobeIcon className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
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

            <TenantFooter />
        </div>
    );
}
