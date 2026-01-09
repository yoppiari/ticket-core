"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    rank: number;
    name: string;
    points: number;
}

interface LeaderboardData {
    name: string;
    description: string;
    entries: LeaderboardEntry[];
}

export default function LeaderboardWidget() {
    const { id } = useParams();

    const { data, isLoading, error } = useQuery<LeaderboardData>({
        queryKey: ["leaderboard", id],
        queryFn: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/embed/leaderboards/${id}`);
            if (!res.ok) throw new Error("Failed to fetch leaderboard");
            return res.json();
        },
        refetchInterval: 10000, // Poll every 10s
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8 bg-zinc-50 rounded-xl border">
                <div className="animate-pulse space-y-4 w-full">
                    <div className="h-4 bg-zinc-200 rounded w-3/4 mx-auto"></div>
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 bg-zinc-200 rounded w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-8 bg-red-50 text-red-600 rounded-xl border border-red-200">
                Failed to load leaderboard.
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="bg-white dark:bg-zinc-950 rounded-xl overflow-hidden border dark:border-zinc-800 shadow-sm w-full max-w-md mx-auto font-sans">
            <div className="bg-zinc-900 text-white p-4 text-center">
                <h2 className="text-xl font-bold">{data.name}</h2>
                {data.description && <p className="text-zinc-400 text-xs mt-1">{data.description}</p>}
            </div>

            <div className="divide-y dark:divide-zinc-800">
                <div className="grid grid-cols-12 gap-2 p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-900">
                    <div className="col-span-2 text-center">Rank</div>
                    <div className="col-span-7">Participant</div>
                    <div className="col-span-3 text-right">Points</div>
                </div>

                {data.entries.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 italic">
                        No participants yet.
                    </div>
                ) : (
                    data.entries.map((entry) => (
                        <div
                            key={entry.rank}
                            className={cn(
                                "grid grid-cols-12 gap-2 p-3 items-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm",
                                entry.rank <= 3 ? "font-semibold" : ""
                            )}
                        >
                            <div className="col-span-2 text-center flex justify-center">
                                {entry.rank === 1 && <span className="text-xl">🥇</span>}
                                {entry.rank === 2 && <span className="text-xl">🥈</span>}
                                {entry.rank === 3 && <span className="text-xl">🥉</span>}
                                {entry.rank > 3 && <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs">{entry.rank}</span>}
                            </div>
                            <div className="col-span-7 truncate">
                                {entry.name}
                            </div>
                            <div className="col-span-3 text-right font-mono text-blue-600 dark:text-blue-400">
                                {new Intl.NumberFormat().format(entry.points)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 text-center text-[10px] text-zinc-400 uppercase tracking-widest border-t dark:border-zinc-800">
                Powered by Tukutix
            </div>
        </div>
    );
}
