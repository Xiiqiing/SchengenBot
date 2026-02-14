'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/user-id';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const userId = getUserId();
        if (!userId) {
            router.replace('/');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return null; // Or a loading spinner
    }

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            {children}
        </div>
    );
}
