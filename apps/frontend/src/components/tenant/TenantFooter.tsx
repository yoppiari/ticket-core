import Link from "next/link";
import { cn } from "@/lib/utils";

interface TenantFooterProps {
    className?: string;
}

export default function TenantFooter({ className }: TenantFooterProps) {
    return (
        <footer className={cn(
            "p-8 border-t mt-auto text-center text-zinc-400 text-xs font-medium uppercase tracking-widest border-zinc-200 bg-zinc-50",
            className
        )}>
            &copy; {new Date().getFullYear()} <Link href="/" className="hover:text-zinc-600 transition-colors">Tukutix</Link>. Powered by Tukutix.
        </footer>
    );
}
