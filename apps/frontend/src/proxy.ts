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
    // const rootDomain = "localhost"; // Unused

    // If we are on the root domain (e.g. landing page or app login), do nothing (or rewrite to /home)
    // But here we need to detect SUBDOMAIN.

    // Simplification for now:
    // If host is NOT localhost and NOT app.localhost, assumption is text is subdomain
    // Actually, let's use a simpler heuristic for this task:
    // If it's valid subdomain -> Rewrite to /_tenants/[subdomain]

    const isSubdomain =
        currentHost !== "localhost" &&
        currentHost !== "www.localhost" &&
        currentHost !== "tukutix.com" &&
        currentHost !== "www.tukutix.com" &&
        !currentHost.endsWith(".vercel.app");

    // Affiliate Logic: Check for ?ref=CODE
    // We want to capture it and set a cookie, then proceed.
    // We can do this before or after subdomain rewrite.
    const urlSearchParams = req.nextUrl.searchParams;
    const refCode = urlSearchParams.get("ref");

    let response = NextResponse.next();

    if (isSubdomain) {
        const subdomain = currentHost.split(".")[0];
        // Rewrite to the tenant dynamic route
        response = NextResponse.rewrite(new URL(`/_tenants/${subdomain}${url.pathname}`, req.url));
    }

    if (refCode) {
        // Set cookie for 30 days
        response.cookies.set("affiliate_ref", refCode, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
            // httpOnly: true, // If we want to hide it from validation scripts? No, keep it accessible if needed.
            // secure: process.env.NODE_ENV === 'production',
        });
    }

    return response;
}
