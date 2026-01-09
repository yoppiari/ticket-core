"use client";

import { useState } from "react";

export default function SystemSettingsPage() {
    const [platformFee, setPlatformFee] = useState(5000);
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    function handleSave() {
        alert("Settings saved (Simulated)");
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-white">System Settings</h1>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border dark:border-zinc-800 shadow-sm max-w-2xl">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-bold mb-4">Financial Configuration</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                                    Platform Fee (Per Ticket)
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 font-bold">Rp</span>
                                    <input
                                        type="number"
                                        value={platformFee}
                                        onChange={(e) => setPlatformFee(Number(e.target.value))}
                                        className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">This fee is automatically added to every ticket sold.</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t dark:border-zinc-800 pt-6">
                        <h2 className="text-lg font-bold mb-4 text-red-600">Danger Zone</h2>
                        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                            <div>
                                <h3 className="font-bold text-red-900 dark:text-red-200">Maintenance Mode</h3>
                                <p className="text-sm text-red-700 dark:text-red-300">Suspend all public access to the platform.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={maintenanceMode}
                                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
