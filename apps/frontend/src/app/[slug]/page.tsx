
import { getTenant } from "@/lib/data";

export default async function TenantPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tenant = await getTenant(slug);

    return (
        <div className="min-h-screen flex flex-col bg-zinc-50">
            <header
                className="py-4 px-6 text-white font-bold shadow-md sticky top-0 z-10 text-xl"
                style={{ backgroundColor: tenant.branding?.primary_color || '#333' }}
            >
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="uppercase tracking-wider">{tenant.name}</div>
                    <div className="text-sm opacity-90 font-normal">Official Page</div>
                </div>
            </header>

            <main className="flex-1 container mx-auto p-8 max-w-7xl">
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-zinc-200 text-center">
                    <h1 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight">Welcome to {tenant.name}</h1>
                    <p className="text-zinc-500 text-lg">We are preparing some amazing events for you. Check back soon!</p>
                </div>
            </main>

            <footer className="p-8 border-t mt-auto text-center text-zinc-400 text-xs font-medium uppercase tracking-widest border-zinc-200 bg-zinc-50">
                &copy; 2026 Ticketing Platform. Empowered by ANTIGRAVITY.
            </footer>
        </div>
    );
}
