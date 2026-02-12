'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const locale = useLocale();

    const onSelectChange = (nextLocale: string) => {
        startTransition(() => {
            // Simple path replacement for now. A more robust solution involves checking the pathname.
            // But for this structure, replacing the first segment is decent.
            // Actually, standard way is constructing the URL.
            // But since we are client-side, we can just grab current path and replace the locale prefix.
            const currentPath = window.location.pathname;
            const newPath = currentPath.replace(`/${locale}`, `/${nextLocale}`);
            router.replace(newPath);
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isPending} className="text-[#f5f5f7] hover:bg-white/10 hover:text-white">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Switch Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelectChange('zh')}>
                    中文
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelectChange('en')}>
                    English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
