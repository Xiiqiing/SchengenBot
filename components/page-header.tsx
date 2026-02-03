'use client';

import React, { useEffect, useRef } from 'react';
import { useScrollTitle } from './scroll-title-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    backHref?: string;
    backLabel?: string;
}

export function PageHeader({ title, description, backHref, backLabel = "返回" }: PageHeaderProps) {
    const { setTitle, setShowTitleInNav } = useScrollTitle();
    const headerRef = useRef<HTMLDivElement>(null);

    // Update title in context on mount
    useEffect(() => {
        setTitle(title);
        return () => setTitle(''); // Cleanup
    }, [title, setTitle]);

    // Intersection observer to toggle visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If header is NOT intersecting (scrolled out of view), show title in nav
                // We use isIntersecting because when it's NOT intersecting (and we are scrolled down), we show title.
                // Note: This logic assumes the header is at the top. If we scroll UP, it becomes intersecting again.
                // We also check boundingClientRect.top to ensure we only trigger when scrolling DOWN past it, not unrelated visibility.
                const isScrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
                setShowTitleInNav(isScrolledPast);
            },
            {
                root: null,
                threshold: 0,
                rootMargin: "-48px 0px 0px 0px" // Offset for the fixed nav bar height
            }
        );

        if (headerRef.current) {
            observer.observe(headerRef.current);
        }

        return () => {
            observer.disconnect();
            setShowTitleInNav(false); // Reset on unmount
        };
    }, [setShowTitleInNav]);

    return (
        <header ref={headerRef} className="bg-transparent pt-8 pb-6 transition-opacity duration-300">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center gap-4">
                    {backHref && (
                        <Link href={backHref}>
                            <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/50 h-9 px-4 text-[#1d1d1f]">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {backLabel}
                            </Button>
                        </Link>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">{title}</h1>
                        {description && <p className="text-sm text-gray-500 font-medium tracking-tight mt-1">{description}</p>}
                    </div>
                </div>
            </div>
        </header>
    );
}
