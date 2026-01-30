'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { getTicket, updateTicketStatus, addScanLog, getPendingLogs, markLogsSynced, saveTickets } from '@/lib/scanner/sync';
import { v4 as uuidv4 } from 'uuid';
import { Wifi, WifiOff, Download, Scan } from 'lucide-react';

type ScanMode = 'online' | 'offline' | null;

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<{ status: string; message: string; ticket?: any } | null>(null);
    const [scanMode, setScanMode] = useState<ScanMode>(null);
    const [eventId, setEventId] = useState<string>('');
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

        // 1. Online Mode
        if (scanMode === 'online') {
            await handleOnlineScan(decodedText);
            return;
        }

        // 2. Offline Mode
        await handleOfflineScan(decodedText);
    }

    async function handleOnlineScan(ticketCode: string) {
        const token = localStorage.getItem('auth_token');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scanner/events/${eventId}/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ ticket_code: ticketCode }),
            });

            if (!res.ok) {
                setScanResult({ status: 'invalid', message: 'Network Error or Access Denied' });
                return;
            }

            const data = await res.json();
            setScanResult({
                status: data.status,
                message: data.message,
                ticket: data.ticket
            });

        } catch (err: any) {
            setScanResult({ status: 'invalid', message: err.message });
        }
    }

    async function handleOfflineScan(ticketCode: string) {
        const ticket = await getTicket(ticketCode);
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
                await updateTicketStatus(ticketCode, 'valid', scannedAt);
            }
        }

        setScanResult({ status, message, ticket });

        // Log it
        const logId = uuidv4();
        await addScanLog({
            id: logId,
            ticket_code: ticketCode,
            event_id: eventId,
            scanned_at: scannedAt,
            status: status, // valid, duplicate, invalid
            synced: false,
        });

        updatePendingCount();
    }

    useEffect(() => {
        if (eventId && scanMode) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
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
    }, [eventId, scanMode]);

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
            setScanMode('offline');
            alert(`Downloaded ${tickets.length} tickets! Ready to scan offline.`);
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
            }
        } catch (err) {
            console.error("Sync failed", err);
        }
    }

    // 1. Initial State: Event Selection
    if (!eventId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-950 text-white">
                <div className="w-full max-w-sm space-y-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-black tracking-tight">Select Event</h2>
                        <p className="text-zinc-500 text-sm">Enter Event ID to start scanning</p>
                    </div>

                    <div className="space-y-4">
                        <input
                            className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white outline-none focus:ring-1 focus:ring-blue-500 transition font-mono text-center"
                            placeholder="Event UUID"
                            value={inputEventId}
                            onChange={e => setInputEventId(e.target.value)}
                        />

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={downloadTickets}
                                className="flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl font-bold transition border border-zinc-700"
                            >
                                <Download size={18} />
                                Download for Offline
                            </button>
                            <button
                                onClick={() => {
                                    if (!inputEventId) return;
                                    setEventId(inputEventId);
                                    setScanMode('online');
                                }}
                                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition"
                            >
                                <Wifi size={18} />
                                Start Online Scan
                            </button>
                        </div>
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

    // 2. Scanner Interface
    return (
        <div className="space-y-4 max-w-md mx-auto">
            {/* Header / Status Bar */}
            <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-2 text-sm font-medium">
                    {scanMode === 'online' ? (
                        <span className="flex items-center gap-2 text-green-400">
                            <Wifi size={16} /> Online Mode
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-yellow-400">
                            <WifiOff size={16} /> Offline Mode
                        </span>
                    )}
                </div>
                <button
                    onClick={() => {
                        setEventId('');
                        setScanMode(null);
                        setScanResult(null);
                    }}
                    className="text-xs text-zinc-500 hover:text-white"
                >
                    Change Event
                </button>
            </div>

            {/* Scanner View */}
            <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border border-zinc-800"></div>

            {/* Result Overlay */}
            {scanResult && (
                <div className={`p-6 rounded-xl text-center font-bold text-xl shadow-2xl animate-in fade-in zoom-in duration-300 ${scanResult.status === 'valid' ? 'bg-green-600 text-white' :
                        scanResult.status === 'duplicate' ? 'bg-yellow-500 text-black' :
                            'bg-red-600 text-white'
                    }`}>
                    <div className="text-3xl mb-1">{scanResult.status === 'valid' ? '✅' : scanResult.status === 'duplicate' ? '⚠️' : '🚫'}</div>
                    <div className="text-2xl tracking-tight">{scanResult.status.toUpperCase()}</div>
                    <div className="text-base font-normal mt-1 opacity-90">{scanResult.message}</div>

                    {scanResult.ticket && (
                        <div className="mt-4 pt-4 border-t border-white/20 text-sm font-mono opacity-75">
                            {scanResult.ticket.ticket_code}
                            {scanResult.ticket.metadata && (
                                <div className="mt-1 text-xs">
                                    {JSON.stringify(scanResult.ticket.metadata)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Offline Sync Status (Only valid in offline mode) */}
            {scanMode === 'offline' && (
                <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg border border-zinc-800">
                    <div className="text-sm text-zinc-400">
                        Pending Sync: <span className="text-white font-bold">{pendingCount}</span>
                    </div>
                    <button
                        onClick={syncUp}
                        disabled={pendingCount === 0}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        Sync To Server
                    </button>
                </div>
            )}

            <div className="text-center text-xs text-zinc-600 font-mono">
                Event: {eventId}
            </div>
        </div>
    );
}
