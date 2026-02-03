'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Settings, History, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollTitle } from './scroll-title-context';

const NAV_ITEMS = [
    { name: '控制台', href: '/dashboard', icon: LayoutGrid },
    { name: '历史记录', href: '/dashboard/history', icon: History },
    { name: '偏好设置', href: '/dashboard/settings', icon: Settings },
];

export function AppleGlobalNav() {
    const pathname = usePathname();
    const { title, showTitleInNav } = useScrollTitle();

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#161617]/80 backdrop-blur-md border-b border-white/5 h-[48px]">
            <div className="max-w-[980px] mx-auto h-full px-4 flex items-center justify-between">
                {/* Logo / Title Area */}
                <div className="flex items-center min-w-[140px]">
                    <div className={cn(
                        "transition-all duration-500 ease-in-out absolute transform",
                        showTitleInNav ? "-translate-y-4 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
                    )}>
                        <Link href="/" className="text-[#f5f5f7] hover:opacity-80 transition-opacity flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <span className="font-semibold tracking-tight text-sm translate-y-[1px]">SchengenBot</span>
                        </Link>
                    </div>

                    <div className={cn(
                        "transition-all duration-500 ease-in-out absolute transform pointer-events-none",
                        showTitleInNav ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    )}>
                        <span className="font-semibold tracking-tight text-sm text-[#f5f5f7] translate-y-[1px]">{title}</span>
                    </div>
                </div>

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

                {/* Spacer to balance layout if needed, or mobile menu trigger later */}
                <div className="w-[140px] hidden md:block" />
                <div className="w-5 md:hidden" />
            </div>
        </nav>
    );
}
