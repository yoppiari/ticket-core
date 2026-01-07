
import { getTenant } from "@/lib/data";
import TenantStyleProvider from "@/components/tenant/TenantStyleProvider";

export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const tenant = await getTenant(slug);

    return (
        <>
            <TenantStyleProvider branding={tenant.branding} />
            {children}
        </>
    );
}
