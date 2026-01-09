import Link from "next/link";
import { cn } from "@/lib/utils";

interface TenantHeaderProps {
    tenant: {
        name: string;
        slug: string;
        branding?: {
            primary_color?: string;
        };
    };
    className?: string;
}

export default function TenantHeader({ tenant, className }: TenantHeaderProps) {
    return (
        <header
            className={cn(
                "py-4 px-6 text-white shadow-md sticky top-0 z-50 transition-colors",
                className
            )}
            style={{ backgroundColor: tenant.branding?.primary_color || '#333' }}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href={`/${tenant.slug}`} className="hover:opacity-90 transition-opacity">
                    <div className="font-bold text-xl uppercase tracking-wider">{tenant.name}</div>
                </Link>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                    <div className="text-sm opacity-90 font-normal">Powered by Tukutix</div>
                </Link>
            </div>
        </header>
    );
}
