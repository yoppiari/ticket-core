"use client";

import { Button } from "@/components/ui/button";
import { Share2Icon, CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
    eventName: string;
    eventDescription?: string;
    url?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export default function ShareButton({
    eventName,
    eventDescription,
    url,
    variant = "outline",
    size = "lg",
    className
}: ShareButtonProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleShare = async () => {
        const shareUrl = url || window.location.href;
        const shareData = {
            title: eventName,
            text: eventDescription || `Check out ${eventName}!`,
            url: shareUrl,
        };

        // Try using Web Share API
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                // User cancelled or share failed, fallback to copy
                // User cancelled or share failed, fallback to copy
            }
        }

        // Fallback: Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy URL", err);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleShare}
        >
            {isCopied ? (
                <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Copied!
                </>
            ) : (
                <>
                    <Share2Icon className="w-4 h-4 mr-2" />
                    Share
                </>
            )}
        </Button>
    );
}
