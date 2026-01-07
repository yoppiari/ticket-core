
import { getQueueStatus, sendHeartbeat } from "@/lib/data";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import ClientRedirect from "./ClientRedirect";

export default async function WaitingRoomPage({ params }: { params: Promise<{ slug: string, eventSlug: string }> }) {
    const { slug, eventSlug } = await params;
    const status = await getQueueStatus(eventSlug);

    if (status?.status === 'admitted') {
        redirect(`/${slug}/e/${eventSlug}`);
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="space-y-4">
                    <div className="inline-block p-4 bg-blue-600 rounded-3xl animate-pulse shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                        <Loader2 className="w-12 h-12 animate-spin text-white" />
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter text-white">WAITING LINE</h1>
                    <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                        Things are heating up! You&apos;re in line. Hang tight, we&apos;ll get you in as soon as a spot opens up.
                    </p>
                </div>

                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/10">
                    <CardHeader className="pt-8 px-8 border-b border-zinc-800">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-blue-400">Queue Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-tight text-zinc-500">
                                <span>Your Position</span>
                                <span>{status?.position || '...'} / {status?.total_waiting || '...'}</span>
                            </div>
                            <Progress value={status ? (1 - (status.position / status.total_waiting)) * 100 : 0} className="h-2 bg-zinc-800" />
                        </div>

                        <div className="bg-zinc-950/50 rounded-2xl p-6 border border-zinc-800/50">
                            <div className="text-4xl font-black text-white mb-2">
                                #{status?.position || '??'}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                Please do not refresh this page
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Next status update in 5 seconds
                </div>

                {/* Client component for polling and heartbeat */}
                <ClientRedirect eventSlug={eventSlug} targetUrl={`/${slug}/e/${eventSlug}`} />
            </div>
        </div>
    );
}
