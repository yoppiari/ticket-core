import { getTenant, getTenantEvents } from "@/lib/data";
import TenantHeader from "@/components/tenant/TenantHeader";
import TenantFooter from "@/components/tenant/TenantFooter";
import Link from "next/link";
import { CalendarIcon, MapPinIcon, TicketIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function TenantPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tenant = await getTenant(slug);
    const events = await getTenantEvents(slug);

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50">
            <TenantHeader tenant={{ name: tenant.name, slug, branding: tenant.branding }} />

            <main className="flex-1 container mx-auto p-6 md:p-8 max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight">Welcome to {tenant.name}</h1>
                </div>

                {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event: any) => (
                            <Link href={`/${slug}/e/${event.slug}`} key={event.id} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-zinc-200 overflow-hidden">
                                <div className="relative h-48 bg-zinc-100">
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
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-zinc-900 mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
                                        {event.name}
                                    </h3>
                                    <div className="space-y-2 text-sm text-zinc-500">
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
                                        <span>Get Tickets</span>
                                        <TicketIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-12 rounded-2xl shadow-sm border border-zinc-200 text-center">
                        <p className="text-zinc-500 text-lg">We are preparing some amazing events for you. Check back soon!</p>
                    </div>
                )}
            </main>

            <TenantFooter />
        </div>
    );
}
