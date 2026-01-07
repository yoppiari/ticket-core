import { NextRequest, NextResponse } from "next/server";

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // Define allowed domains (including localhost and main domain)
    // For local: localhost:3000, site.com
    // We want to detect: tenant.localhost:3000

    // Basic Logic:
    // 1. Get current host (e.g. "fest-a.localhost:3000")
    // 2. Remove port
    // 3. Check if it's a subdomain

    const currentHost = hostname.replace(/:\d+$/, ""); // Remove port
    const rootDomain = "localhost"; // TODO: Make this env var (NEXT_PUBLIC_ROOT_DOMAIN)

    // If we are on the root domain (e.g. landing page or app login), do nothing (or rewrite to /home)
    // But here we need to detect SUBDOMAIN.

    // Simplification for now:
    // If host is NOT localhost and NOT app.localhost, assumption is text is subdomain
    // Actually, let's use a simpler heuristic for this task:
    // If it's valid subdomain -> Rewrite to /_tenants/[subdomain]

    const isSubdomain =
        currentHost !== "localhost" &&
        currentHost !== "www.localhost" &&
        !currentHost.endsWith(".vercel.app"); // Adjust as needed

    if (isSubdomain) {
        const subdomain = currentHost.split(".")[0];
        // Rewrite to the tenant dynamic route
        return NextResponse.rewrite(new URL(`/_tenants/${subdomain}${url.pathname}`, req.url));
    }

    return NextResponse.next();
}
