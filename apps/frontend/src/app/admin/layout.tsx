import { Sidebar } from "@/components/admin/Sidebar";
import { MobileNav } from "@/components/admin/MobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-900">
            {/* Mobile Header */}
            <MobileNav />

            {/* Desktop Sidebar */}
            <Sidebar className="hidden md:flex w-64 flex-shrink-0 fixed h-full" />

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 p-0">
                {/* Note: margin-left 64 (16rem/256px) matches sidebar width */}
                {children}
            </div>
        </div>
    );
}
