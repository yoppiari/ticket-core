import { openDB } from 'idb';

const DB_NAME = 'scanner-db';
const DB_VERSION = 1;

interface Ticket {
    id: string;
    ticket_code: string;
    status: string; // valid, used, revoked
    checked_in_at?: string | null;
    metadata?: any;
    event_id: string;
}

interface ScanLog {
    id: string;
    ticket_code: string;
    event_id: string;
    scanned_at: string;
    device_id?: string;
    status: string; // The status determined LOCALLY (valid, duplicate, invalid)
    synced: boolean;
}

const dbPromise = typeof window !== 'undefined' ? openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('tickets')) {
            const store = db.createObjectStore('tickets', { keyPath: 'ticket_code' });
            store.createIndex('event_id', 'event_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('logs')) {
            db.createObjectStore('logs', { keyPath: 'id' });
        }
    },
}) : Promise.resolve(null as any);

export async function saveTickets(tickets: Ticket[]) {
    const db = await dbPromise;
    if (!db) return;
    const tx = db.transaction('tickets', 'readwrite');
    const store = tx.objectStore('tickets');
    for (const ticket of tickets) {
        store.put(ticket);
    }
    await tx.done;
}

export async function getTicket(code: string): Promise<Ticket | undefined> {
    const db = await dbPromise;
    if (!db) return undefined;
    return db.get('tickets', code);
}

export async function updateTicketStatus(code: string, status: string, checkedInAt: string) {
    const db = await dbPromise;
    if (!db) return;
    const ticket = await db.get('tickets', code);
    if (ticket) {
        ticket.status = status; // e.g. 'used' or just keep valid but set checked_in_at
        ticket.checked_in_at = checkedInAt;
        await db.put('tickets', ticket);
    }
}

export async function addScanLog(log: ScanLog) {
    const db = await dbPromise;
    if (!db) return;
    await db.put('logs', log);
}

export async function getPendingLogs(): Promise<ScanLog[]> {
    const db = await dbPromise;
    if (!db) return [];
    const logs = await db.getAll('logs');
    return logs.filter((log: ScanLog) => !log.synced);
}

export async function markLogsSynced(ids: string[]) {
    const db = await dbPromise;
    if (!db) return;
    const tx = db.transaction('logs', 'readwrite');
    const store = tx.objectStore('logs');
    for (const id of ids) {
        const log = await store.get(id);
        if (log) {
            log.synced = true;
            await store.put(log);
            // Optionally delete synced logs to save space?
            // await store.delete(id); 
        }
    }
    await tx.done;
}
