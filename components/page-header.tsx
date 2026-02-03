'use client';

import React, { useEffect, useRef } from 'react';
import { useScrollTitle } from './scroll-title-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    backHref?: string;
    backLabel?: string;
}

export function PageHeader({ title, description, icon, backHref, backLabel = "返回" }: PageHeaderProps) {
    const { setTitle, setIcon, setBackHref, setShowTitleInNav } = useScrollTitle();
    const headerRef = useRef<HTMLDivElement>(null);

    // Update context on mount
    useEffect(() => {
        setTitle(title);
        setIcon(icon || null);
        setBackHref(backHref || null);

        return () => {
            setTitle('');
            setIcon(null);
            setBackHref(null);
        };
    }, [title, icon, backHref, setTitle, setIcon, setBackHref]);

    // Intersection observer to toggle visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isScrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
                setShowTitleInNav(isScrolledPast);
            },
            {
                root: null,
                threshold: 0,
                rootMargin: "-48px 0px 0px 0px"
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
