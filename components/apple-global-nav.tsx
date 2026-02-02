'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Settings, History, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { name: '控制台', href: '/dashboard', icon: LayoutGrid },
    { name: '历史记录', href: '/dashboard/history', icon: History },
    { name: '偏好设置', href: '/dashboard/settings', icon: Settings },
];

export function AppleGlobalNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#161617]/80 backdrop-blur-md border-b border-white/5 h-[48px]">
            <div className="max-w-[980px] mx-auto h-full px-4 flex items-center justify-between">
                {/* Logo Area */}
                <Link href="/" className="text-[#f5f5f7] hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                        <Command className="w-5 h-5" />
                        <span className="font-semibold tracking-tight text-sm">SchengenBot</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="flex items-center gap-6">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-[12px] font-medium transition-colors hover:text-white",
                                    isActive ? "text-white" : "text-[#d6d6d6]/80"
                                )}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Menu Trigger (Placeholder) - Apple uses 2 lines usually */}
                {/* For now, just a simple status indicator or empty to keep clean */}
                <div className="w-5" />
            </div>
        </nav>
    );
}
