'use client';

import React, { createContext, useContext, useState } from 'react';

type ScrollTitleContextType = {
    title: string;
    setTitle: (title: string) => void;
    icon: React.ReactNode;
    setIcon: (icon: React.ReactNode) => void;
    backHref: string | null;
    setBackHref: (href: string | null) => void;
    showTitleInNav: boolean;
    setShowTitleInNav: (show: boolean) => void;
};

const ScrollTitleContext = createContext<ScrollTitleContextType>({
    title: '',
    setTitle: () => { },
    icon: null,
    setIcon: () => { },
    backHref: null,
    setBackHref: () => { },
    showTitleInNav: false,
    setShowTitleInNav: () => { },
});

export function ScrollTitleProvider({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = useState('');
    const [icon, setIcon] = useState<React.ReactNode>(null);
    const [backHref, setBackHref] = useState<string | null>(null);
    const [showTitleInNav, setShowTitleInNav] = useState(false);

    return (
        <ScrollTitleContext.Provider value={{
            title, setTitle,
            icon, setIcon,
            backHref, setBackHref,
            showTitleInNav, setShowTitleInNav
        }}>
            {children}
        </ScrollTitleContext.Provider>
    );
}

export const useScrollTitle = () => useContext(ScrollTitleContext);
