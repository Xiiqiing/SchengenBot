'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Settings, History, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollTitle } from './scroll-title-context';
import LanguageSwitcher from './language-switcher';

const NAV_ITEMS = [
    { name: '控制台', href: '/dashboard', icon: LayoutGrid },
    { name: '历史记录', href: '/dashboard/history', icon: History },
    { name: '偏好设置', href: '/dashboard/settings', icon: Settings },
];

export function AppleGlobalNav() {
    const pathname = usePathname();
    const { title, icon, backHref, showTitleInNav } = useScrollTitle();

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
                        "transition-all duration-500 ease-in-out absolute transform pointer-events-none flex items-center gap-2",
                        showTitleInNav ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    )}>
                        {/* If backHref exists, show a back button like UI */}
                        {backHref ? (
                            <Link href={backHref} className="flex items-center gap-1 text-[#2997ff] hover:opacity-80 transition-opacity pointer-events-auto cursor-pointer">
                                <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-180 w-4 h-4">
                                    <path d="M2.5 13L7.5 8L2.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex items-center gap-2 text-[#f5f5f7]">
                                    {icon && <span className="text-[#f5f5f7]">{icon}</span>}
                                    <span className="font-semibold tracking-tight text-sm translate-y-[1px]">{title}</span>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 text-[#f5f5f7]">
                                {icon && <span>{icon}</span>}
                                <span className="font-semibold tracking-tight text-sm translate-y-[1px]">{title}</span>
                            </div>
                        )}
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
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <div className="w-5 md:hidden" />
                </div>
            </div>
        </nav>
    );
}
