'use client';

import React, { createContext, useContext, useState } from 'react';

type ScrollTitleContextType = {
    title: string;
    setTitle: (title: string) => void;
    showTitleInNav: boolean;
    setShowTitleInNav: (show: boolean) => void;
};

const ScrollTitleContext = createContext<ScrollTitleContextType>({
    title: '',
    setTitle: () => { },
    showTitleInNav: false,
    setShowTitleInNav: () => { },
});

export function ScrollTitleProvider({ children }: { children: React.ReactNode }) {
    const [title, setTitle] = useState('');
    const [showTitleInNav, setShowTitleInNav] = useState(false);

    return (
        <ScrollTitleContext.Provider value={{ title, setTitle, showTitleInNav, setShowTitleInNav }}>
            {children}
        </ScrollTitleContext.Provider>
    );
}

export const useScrollTitle = () => useContext(ScrollTitleContext);
