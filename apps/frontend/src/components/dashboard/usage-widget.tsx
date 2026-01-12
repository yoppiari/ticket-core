
"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface UsageStats {
    limit: number;
    usage: number;
    percent: number;
}

export function UsageWidget() {
    const [stats, setStats] = useState<UsageStats | null>(null);
    const [loading, setLoading] = useState(true);

    // In real implementation, this would use a robust fetcher/SWR/TanStack Query
    // and auth headers. For now we assume fetch works or is mocked.
    // Note: Backend API is protected by Sanctum. This component assumes it's
    // mounted in a page where the user is authenticated (cookie-based).

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/dashboard/stats`, {
                    headers: {
                        // In a browser with cookies, this should send session automatically 
                        // IF configured correctly (SameSite/CORS).
                        // For this demo context we might need to rely on existing auth state.
                        "Accept": "application/json"
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch usage stats", e);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    if (loading) return <div>Loading Usage...</div>;
    if (!stats) return <div>Failed to load usage data.</div>;

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Plan Usage</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span>Tickets Sold</span>
                        <span className="font-bold">{stats.usage} / {stats.limit}</span>
                    </div>

                    <Progress value={stats.percent} className={stats.percent > 90 ? "bg-red-200" : ""} indicatorClassName={stats.percent > 90 ? "bg-red-600" : ""} />

                    {stats.percent > 90 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Upgrade Needed</AlertTitle>
                            <AlertDescription>
                                You have used over 90% of your plan limit.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
