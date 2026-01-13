"use client";

import { Button } from "@/components/ui/button";
import { BellIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Assuming sonner is used, if not we'll use window.alert as fallback for now or check dependencies

interface RemindMeButtonProps {
    tenantSlug: string;
    eventSlug: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export default function RemindMeButton({
    tenantSlug,
    eventSlug,
    variant = "outline",
    size = "lg",
    className
}: RemindMeButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${baseUrl}/api/public/tenants/${tenantSlug}/events/${eventSlug}/remind`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle conflict specifically
                if (res.status === 409) {
                    setIsSuccess(true); // Treat as success for UX ("already registered" is good)
                    // Optionally show a different message
                    return;
                }
                throw new Error(data.message || 'Something went wrong');
            }

            setIsSuccess(true);
        } catch (error: any) {
            console.error(error);
            alert(error.message); // Basic error handling
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Button
                variant={variant}
                size={size}
                className={`${className} bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-default`}
                disabled
            >
                <BellIcon className="w-4 h-4 mr-2" />
                You&apos;re on the list!
            </Button>
        );
    }

    return (
        <>
            <Button
                variant={variant}
                size={size}
                className={className}
                onClick={() => setIsOpen(true)}
            >
                <BellIcon className="w-4 h-4 mr-2" />
                Remind Me
            </Button>

            {/* Simple Modal Portal logic would be better, but inline works for simple cases if z-index is high enough */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100">
                            <h3 className="text-lg font-bold text-zinc-900">Get Notified</h3>
                            <p className="text-sm text-zinc-500 mt-1">
                                We&apos;ll send you an email when tickets become available.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-zinc-700">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="bg-black text-white hover:bg-zinc-800"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Notify Me'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
