'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, setUserId } from '@/lib/user-id';

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
            fetch('/api/auth/session')
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error('Unauthorized');
                    }

                    return await response.json();
                })
                .then((data) => {
                    if (data?.userId) {
                        setUserId(data.userId);
                        setIsAuthorized(true);
                        return;
                    }

                    router.replace('/');
                })
                .catch(() => {
                    router.replace('/');
                });
            return;
        }

        setIsAuthorized(true);
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
