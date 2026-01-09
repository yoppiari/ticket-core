'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getTicket, updateTicketStatus, addScanLog, getPendingLogs, markLogsSynced, saveTickets } from '@/lib/scanner/sync';
import { v4 as uuidv4 } from 'uuid';

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<{ status: string; message: string; ticket?: any } | null>(null);
    const [offlineMode, setOfflineMode] = useState(false);
    const [eventId, setEventId] = useState<string>(''); // Should select event first
    // For MVP, hardcode or prompt for Event ID? 
    // Let's assume URL param or simple input for now.
    const [inputEventId, setInputEventId] = useState('');

    // Sync State
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Check pending logs count on mount
        updatePendingCount();
    }, []);

    async function updatePendingCount() {
        const logs = await getPendingLogs();
        setPendingCount(logs.length);
    }

    async function onScanSuccess(decodedText: string, decodedResult: any) {
        if (!eventId) {
            alert("Please select Event ID first");
            return;
        }

        // Debounce? Html5QrcodeScanner usually handles some.
        // Logic: Look up in IDB
        const ticket = await getTicket(decodedText);
        const scannedAt = new Date().toISOString();
        let status = 'invalid';
        let message = 'Ticket not found';

        if (ticket) {
            if (ticket.event_id !== eventId) {
                status = 'invalid';
                message = 'Ticket is for another event';
            } else if (ticket.checked_in_at) {
                status = 'duplicate';
                message = `Already scanned at ${new Date(ticket.checked_in_at).toLocaleTimeString()}`;
            } else {
                status = 'valid';
                message = 'Welcome!';
                // Update Local State
                await updateTicketStatus(decodedText, 'valid', scannedAt);
            }
        }

        setScanResult({ status, message, ticket });

        // Log it
        const logId = uuidv4();
        await addScanLog({
            id: logId,
            ticket_code: decodedText,
            event_id: eventId,
            scanned_at: scannedAt,
            status: status, // valid, duplicate, invalid
            synced: false,
        });

        updatePendingCount();

        // Try Auto-Sync if Online?
        if (navigator.onLine) {
            syncUp();
        }
    }

    useEffect(() => {
        if (eventId) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
            );
            scanner.render(onScanSuccess, (err) => {
                // console.warn(err); 
            });

            return () => {
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            };
        }
    }, [eventId]);

    useEffect(() => {
        // Auth Check
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '/scanner/login';
        }
    }, []);

    async function downloadTickets() {
        if (!inputEventId) return;
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scanner/events/${inputEventId}/tickets`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) {
                if (res.status === 403) throw new Error('Access Denied: Invalid Event for your Tenant');
                throw new Error('Failed to fetch');
            }
            const tickets = await res.json();
            await saveTickets(tickets);
            setEventId(inputEventId);
            alert(`Downloaded ${tickets.length} tickets! Ready to scan.`);
        } catch (err: any) {
            alert('Error downloading tickets: ' + err.message);
        }
    }

    async function syncUp() {
        if (!eventId) return;
        const logs = await getPendingLogs();
        if (logs.length === 0) return;

        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scanner/events/${eventId}/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ logs }),
            });
            if (res.ok) {
                await markLogsSynced(logs.map(l => l.id));
                updatePendingCount();
                console.log("Synced successfully");
            }
        } catch (err) {
            console.error("Sync failed", err);
        }
    }

    if (!eventId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-white">
                <div className="w-full max-w-sm space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-black tracking-tight">Select Event</h2>
                        <p className="text-zinc-500 text-sm">Enter Event ID to download tickets</p>
                    </div>

                    <div className="space-y-4">
                        <input
                            className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:ring-1 focus:ring-blue-500 transition font-mono text-center"
                            placeholder="UUID"
                            value={inputEventId}
                            onChange={e => setInputEventId(e.target.value)}
                        />
                        <button
                            onClick={downloadTickets}
                            className="w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition"
                        >
                            Download Database
                        </button>
                    </div>

                    <div className="text-center">
                        <button onClick={() => {
                            localStorage.removeItem('auth_token');
                            window.location.href = '/scanner/login';
                        }} className="text-xs text-zinc-500 underline uppercase tracking-widest font-bold">
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Scanner View */}
            <div id="reader" className="w-full bg-black rounded overflow-hidden"></div>

            {/* Result Overlay */}
            {scanResult && (
                <div className={`p-4 rounded text-center font-bold text-xl ${scanResult.status === 'valid' ? 'bg-green-600' :
                    scanResult.status === 'duplicate' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                    <div>{scanResult.status.toUpperCase()}</div>
                    <div className="text-sm font-normal mt-1">{scanResult.message}</div>
                    {scanResult.ticket && (
                        <div className="text-xs mt-2 opacity-75">
                            {JSON.stringify(scanResult.ticket.metadata || {})}
                        </div>
                    )}
                </div>
            )}

            {/* Sync Status */}
            <div className="flex justify-between items-center bg-gray-800 p-3 rounded">
                <div className="text-sm text-gray-400">
                    Pending Sync: {pendingCount}
                </div>
                <button
                    onClick={syncUp}
                    disabled={pendingCount === 0}
                    className="px-3 py-1 bg-gray-700 rounded text-sm disabled:opacity-50"
                >
                    Sync Now
                </button>
            </div>

            <div className="text-center text-xs text-gray-500">
                Event ID: {eventId}
            </div>
        </div>
    );
}
