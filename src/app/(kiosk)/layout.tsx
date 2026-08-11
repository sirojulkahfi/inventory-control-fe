'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import KioskLayout from '@/components/layout/KioskLayout';

export default function KioskGroup({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!token) {
            router.push('/login');
        }
    }, [token, router]);

    // Avoid hydration mismatch
    if (!mounted) return null;
    if (!token) return null;

    return (
        <KioskLayout>
            {children}
        </KioskLayout>
    );
}
