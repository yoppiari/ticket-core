"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";

interface Event {
  id: string;
  slug: string;
  name: string;
  banner_url?: string;
  start_time: string;
  location: string;
  min_price: number;
  tenant: {
    slug: string;
    name: string;
  };
}

export default function LandingPage() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["public-events"],
    queryFn: async (): Promise<Event[]> => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/public/events`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter">Ticketing.io</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/scanner/login" className="text-sm font-medium hover:underline">
              Scanner App
            </Link>
            <Link href="/affiliate/dashboard" className="text-sm font-medium hover:underline">
              Affiliates
            </Link>
            <Link href="/login" className="text-sm font-medium px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors">
              Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-zinc-900 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
          Unforgettable Experiences
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
          Discover and book tickets for the biggest concerts, festivals, and conferences.
        </p>
      </section>

      {/* Events Grid */}
      <main className="container mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">Upcoming Events</h2>

        {isLoading ? (
          <div className="text-center py-20 text-zinc-500">Loading events...</div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/${event.tenant.slug}/e/${event.slug}`}
                className="group block rounded-2xl overflow-hidden border bg-white dark:bg-zinc-950 hover:shadow-xl transition-all duration-300 dark:border-zinc-800"
              >
                <div className="aspect-video bg-zinc-200 relative overflow-hidden">
                  {event.banner_url ? (
                    <Image
                      src={event.banner_url}
                      alt={event.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-400">
                      No Banner
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-zinc-700 transition-colors text-zinc-900 dark:text-zinc-100">
                    {event.name}
                  </h3>
                  <div className="text-sm text-zinc-500 mt-2 flex flex-col gap-1">
                    <span className="flex items-center gap-1">
                      🕒 {format(new Date(event.start_time), "PPP p")}
                    </span>
                    <span className="flex items-center gap-1">
                      📍 {event.location}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center dark:border-zinc-800 border-zinc-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Starts from
                    </span>
                    <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                      {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(event.min_price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-100 rounded-2xl dark:bg-zinc-800">
            <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">No Events Found</h3>
            <p className="text-zinc-500">Check back later for new events.</p>
          </div>
        )}
      </main>
    </div>
  );
}
