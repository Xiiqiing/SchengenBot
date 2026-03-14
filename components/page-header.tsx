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
        <header ref={headerRef} className="bg-transparent pb-8 pt-10 transition-opacity duration-300 md:pb-10 md:pt-14">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="space-y-5">
                    {backHref && (
                        <Link href={backHref}>
                            <Button variant="ghost" size="sm" className="h-9 rounded-full border border-black/5 bg-white/70 px-4 text-[#1d1d1f] backdrop-blur-sm hover:bg-white">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {backLabel}
                            </Button>
                        </Link>
                    )}
                    <div className="max-w-3xl">
                        {icon && (
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                                {icon}
                            </div>
                        )}
                        <h1 className="text-[40px] font-semibold tracking-[-0.05em] text-[#1d1d1f] md:text-[56px]">
                            {title}
                        </h1>
                        {description && <p className="mt-3 text-base leading-7 text-[#6e6e73] md:text-lg">{description}</p>}
                    </div>
                </div>
            </div>
        </header>
    );
}
