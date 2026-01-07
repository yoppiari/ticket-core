
import { getTenant } from "@/lib/data";

export default async function TenantPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const tenant = await getTenant(slug);

    return (
        <div className="min-h-screen flex flex-col">
            <header
                className="p-4 text-white font-bold"
                style={{ backgroundColor: tenant.branding?.primary_color || '#333' }}
            >
                {tenant.name}
            </header>

            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-4">Welcome to {tenant.name}</h1>
                <p className="text-gray-600">Events coming soon.</p>
            </main>

            <footer className="p-4 bg-gray-100 text-center text-sm">
                Powered by Ticketing Platform
            </footer>
        </div>
    );
}
