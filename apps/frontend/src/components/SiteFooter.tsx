import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="bg-white dark:bg-zinc-950 border-t dark:border-zinc-800 py-12 border-zinc-200">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="font-bold text-2xl tracking-tighter mb-4 block">Tukutix</Link>
                        <p className="text-zinc-500 max-w-sm">
                            The modern, seamless event ticketing platform for everyone. Discover events, book tickets, and create memories.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-300">Browse Events</Link></li>
                            <li><Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-300">Organizer Login</Link></li>
                            <li><Link href="/scanner/login" className="hover:text-zinc-900 dark:hover:text-zinc-300">Scanner App</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-zinc-900 dark:hover:text-zinc-300">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-400">
                    <p>&copy; {new Date().getFullYear()} Tukutix.com. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Powered by Tukutix</p>
                </div>
            </div>
        </footer>
    );
}
