"use client";

import { useEffect } from "react";

interface BrandingConfig {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    logo_url?: string;
}

export default function TenantStyleProvider({ branding }: { branding?: BrandingConfig }) {
    useEffect(() => {
        if (!branding) return;

        const root = document.documentElement;

        if (branding.primary_color) {
            root.style.setProperty("--primary", branding.primary_color);
            // Optional: Generate shades if using Tailwind CSS variables logic
        }

        // Reset if unmounted? Maybe not needed for SPA nav within tenant
        return () => {
            root.style.removeProperty("--primary");
        };
    }, [branding]);

    return null;
}
