
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getTenant(slug: string) {
    try {
        const res = await fetch(`${API_URL}/api/tenants/${slug}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error("Tenant Fetch Failed", res.status, res.statusText);
            return null;
        }

        return await res.json();
    } catch (e) {
        console.error("Failed to fetch tenant", e);
        return null;
    }
}

export async function getPublicEvent(tenantSlug: string, eventSlug: string) {
    try {
        const res = await fetch(`${API_URL}/api/public/tenants/${tenantSlug}/events/${eventSlug}`, {
            cache: 'no-store'
        });

        if (res.status === 429) {
            const queueData = await res.json();
            return { isQueued: true, ...queueData };
        }

        if (!res.ok) {
            console.error("Event Fetch Failed", res.status, res.statusText);
            return null;
        }

        const data = await res.json();
        return { isQueued: false, ...data };
    } catch (e) {
        console.error("Failed to fetch event", e);
        return null;
    }
}

export async function getQueueStatus(eventSlug: string) {
    try {
        const res = await fetch(`${API_URL}/api/public/events/${eventSlug}/queue-status`, { cache: 'no-store' });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export async function sendHeartbeat(eventSlug: string) {
    try {
        const res = await fetch(`${API_URL}/api/public/events/${eventSlug}/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        return res.ok;
    } catch (e) {
        return false;
    }
}

export async function getTenantEvents(tenantSlug: string) {
    try {
        const res = await fetch(`${API_URL}/api/public/events?tenant_slug=${tenantSlug}`, {
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error("Tenant Events Fetch Failed", res.status);
            return [];
        }

        return await res.json();
    } catch (e) {
        console.error("Failed to fetch tenant events", e);
        return [];
    }
}
