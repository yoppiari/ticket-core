'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Event Page Error:', error);
    }, [error]);

    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Something went wrong!</h2>
            <div className="max-w-md bg-zinc-100 p-4 rounded-lg mb-6 text-left overflow-auto max-h-60 w-full">
                <p className="font-mono text-sm text-red-600 break-words">{error.message}</p>
                {error.digest && (
                    <p className="text-xs text-zinc-500 mt-2 border-t border-zinc-200 pt-2">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
            <div className="flex gap-4">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Page
                </Button>
                <Button onClick={() => reset()}>Try Again</Button>
            </div>
        </div>
    );
}
