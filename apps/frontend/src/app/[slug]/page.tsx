import { getTenant, getTenantEvents } from "@/lib/data";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import Link from "next/link";
import { CalendarIcon, MapPinIcon, TicketIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Allow dynamic params at runtime for static export
export const dynamicParams = true;

// Reusing the same function for both upcoming and past? Or just copying the card component
// To keep it clean, let's just duplicate the list logic or create a small helper component in-file if it was bigger.
// For now, I'll inline it but separate logic.

export default async function TenantPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tenant = await getTenant(slug);

    // Default to upcoming
    const upcomingEvents = await getTenantEvents(slug, 'upcoming');

    // Check settings for past events
    const showPastEvents = tenant?.settings?.show_past_events === true;
    let pastEvents = [];
    if (showPastEvents) {
        pastEvents = await getTenantEvents(slug, 'past');
    }

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50">
            <TenantHeader tenant={{ name: tenant.name, slug, branding: tenant.branding }} />

            <main className="flex-1 container mx-auto p-6 md:p-8 max-w-7xl">
                <div className="text-center mb-12">
                    {/* Show logo if available? For now just text */}
                    <h1 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight">Welcome to {tenant.name}</h1>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-zinc-800 mb-6 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-amber-600" />
                        Upcoming Events
                    </h2>
                    {upcomingEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcomingEvents.map((event: any) => (
                                <EventCard key={event.id} event={event} slug={slug} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-zinc-200 text-center">
                            <p className="text-zinc-500 text-lg">We are preparing some amazing events for you. Check back soon!</p>
                        </div>
                    )}
                </div>

                {showPastEvents && pastEvents.length > 0 && (
                    <div className="mt-16 pt-16 border-t border-zinc-200 opacity-80 hover:opacity-100 transition-opacity">
                        <h2 className="text-2xl font-bold text-zinc-500 mb-6 uppercase tracking-wider text-sm">Past Events</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grayscale hover:grayscale-0 transition-all duration-500">
                            {pastEvents.map((event: any) => (
                                <EventCard key={event.id} event={event} slug={slug} />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <TenantFooter />
        </div>
    );
}

function EventCard({ event, slug }: { event: any, slug: string }) {
    return (
        <Link href={`/${slug}/e/${event.slug}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-zinc-200 overflow-hidden h-full flex flex-col">
            <div className="relative h-48 bg-zinc-100 shrink-0">
                {event.banner_url ? (
                    <Image
                        src={event.banner_url}
                        alt={event.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                        <CalendarIcon className="w-12 h-12" />
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-zinc-900 shadow-sm backdrop-blur-sm border-0 font-bold">
                        From Rp {new Intl.NumberFormat('id-ID').format(event.min_price)}
                    </Badge>
                </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                    {event.name}
                </h3>
                <div className="space-y-2 text-sm text-zinc-500 flex-1">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 shrink-0" />
                        <span>
                            {new Date(event.start_time).toLocaleDateString(undefined, {
                                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-amber-600 font-bold text-sm uppercase tracking-wide">
                    <span>{new Date(event.start_time) < new Date() ? 'View Details' : 'Get Tickets'}</span>
                    <TicketIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
