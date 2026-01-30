'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { getTicket, updateTicketStatus, addScanLog, getPendingLogs, markLogsSynced, saveTickets } from '@/lib/scanner/sync';
import { v4 as uuidv4 } from 'uuid';
import { Wifi, WifiOff, Download, Scan, Camera, Image as ImageIcon, RefreshCw, XCircle, CheckCircle } from 'lucide-react';

type ScanMode = 'online' | 'offline' | null;

interface CameraDevice {
    id: string;
    label: string;
}

export default function ScanPage() {
    // App State
    const [scanResult, setScanResult] = useState<{ status: string; message: string; ticket?: any } | null>(null);
    const [scanMode, setScanMode] = useState<ScanMode>(null);
    const [eventId, setEventId] = useState<string>('');
    const [inputEventId, setInputEventId] = useState('');

    // Scanner State
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync State
    const [pendingCount, setPendingCount] = useState(0);

    // Initial Load
    useEffect(() => {
        updatePendingCount();

        // Cleanup on unmount
        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    // Auth Check
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '/scanner/login';
        }
    }, []);

    // Initialize Scanner and Camera List when entering scan mode
    useEffect(() => {
        if (eventId && scanMode && !scannerRef.current) {
            const initScanner = async () => {
                try {
                    // getting cameras
                    const devices = await Html5Qrcode.getCameras();
                    if (devices && devices.length) {
                        setCameras(devices.map(d => ({ id: d.id, label: d.label })));
                        // Default to back camera if possible, or the last one (usually back on mobile)
                        setSelectedCameraId(devices[devices.length - 1].id);
                    }

                    // Init Instance
                    scannerRef.current = new Html5Qrcode("reader");
                } catch (err) {
                    console.error("Error getting cameras", err);
                    alert("Camera permission is required to scan tickets.");
                }
            };
            initScanner();
        }
    }, [eventId, scanMode]);

    async function startScanning() {
        if (!scannerRef.current || !selectedCameraId) return;
        try {
            await scannerRef.current.start(
                selectedCameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                onScanSuccess,
                () => { } // error callback
            );
            setIsScanning(true);
            setScanResult(null);
        } catch (err) {
            console.error("Failed to start scanner", err);
            alert("Failed to start scanner.");
        }
    }

    async function stopScanning() {
        if (!scannerRef.current) return;
        try {
            await scannerRef.current.stop();
            setIsScanning(false);
        } catch (err) {
            console.error("Failed to stop scanner", err);
        }
    }

    const onScanSuccess = useCallback(async (decodedText: string, decodedResult: any) => {
        console.log("Scanned:", decodedText);

        // Optional: Pause scanning briefly to show result? 
        // For now, let's keep scanning but show overlay.

        // 1. Online Mode
        if (scanMode === 'online') {
            await handleOnlineScan(decodedText);
            return;
        }

        // 2. Offline Mode
        await handleOfflineScan(decodedText);
    }, [scanMode, eventId]); // Dependencies for callback

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

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }

        try {
            const result = await scannerRef.current.scanFile(file, true);
            onScanSuccess(result, null);
        } catch (err) {
            console.error("Error scanning file", err);
            alert("Could not find QR code in image.");
        }
    }

    // --- Data Management Functions ---

    async function updatePendingCount() {
        const logs = await getPendingLogs();
        setPendingCount(logs.length);
    }

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

    // --- RENDER ---

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
                                    if (!inputEventId) {
                                        alert("Please enter an Event ID");
                                        return;
                                    }
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
        <div className="space-y-4 max-w-lg mx-auto pb-20">
            {/* Header / Status Bar */}
            <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-lg border border-zinc-800 mx-4 mt-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                    {scanMode === 'online' ? (
                        <span className="flex items-center gap-2 text-green-400">
                            <Wifi size={16} /> Online
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-yellow-400">
                            <WifiOff size={16} /> Offline
                        </span>
                    )}
                </div>
                <button
                    onClick={() => {
                        stopScanning();
                        setEventId('');
                        setScanMode(null);
                        setScanResult(null);
                    }}
                    className="text-xs text-zinc-500 hover:text-white"
                >
                    Change
                </button>
            </div>

            {/* Camera Controls */}
            {cameras.length > 0 && !isScanning && (
                <div className="px-4">
                    <label className="text-xs text-zinc-500 mb-1 block">Select Camera</label>
                    <select
                        className="w-full bg-zinc-900 text-white p-3 rounded-xl border border-zinc-800 outline-none"
                        value={selectedCameraId}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                    >
                        {cameras.map(cam => (
                            <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id.slice(0, 5)}...`}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Scanner Viewport */}
            <div className="relative mx-4 bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 aspect-square flex items-center justify-center">
                {/* ID required for Html5Qrcode */}
                <div id="reader" className="w-full h-full"></div>

                {!isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-10">
                        <Scan size={48} className="text-zinc-600 mb-4" />
                        <p className="text-zinc-400 text-sm">Camera is off</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 px-4">
                {!isScanning ? (
                    <button
                        onClick={startScanning}
                        className="col-span-1 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                    >
                        <Camera size={20} /> Start Cam
                    </button>
                ) : (
                    <button
                        onClick={stopScanning}
                        className="col-span-1 bg-red-600 hover:bg-red-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                    >
                        <XCircle size={20} /> Stop Cam
                    </button>
                )}

                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="col-span-1 bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 border border-zinc-700"
                >
                    <ImageIcon size={20} /> Scan Img
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </button>
            </div>

            {/* Result Overlay / Card */}
            {scanResult && (
                <div className="px-4">
                    <div className={`p-6 rounded-xl text-center font-bold text-xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-300 ${scanResult.status === 'valid' ? 'bg-green-600 text-white' :
                            scanResult.status === 'duplicate' ? 'bg-yellow-500 text-black' :
                                'bg-red-600 text-white'
                        }`}>
                        <div className="text-3xl mb-1 flex justify-center">
                            {scanResult.status === 'valid' ? <CheckCircle size={40} /> :
                                scanResult.status === 'duplicate' ? <RefreshCw size={40} /> : <XCircle size={40} />}
                        </div>
                        <div className="text-2xl tracking-tight mt-2">{scanResult.status.toUpperCase()}</div>
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

                        <button
                            onClick={() => setScanResult(null)}
                            className="mt-4 w-full bg-black/20 hover:bg-black/30 p-2 rounded-lg text-sm text-inherit font-bold"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Offline Sync Status (Only valid in offline mode) */}
            {scanMode === 'offline' && (
                <div className="px-4">
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
                </div>
            )}

            <div className="text-center text-xs text-zinc-600 font-mono mt-8">
                Event: {eventId}
            </div>
        </div>
    );
}
