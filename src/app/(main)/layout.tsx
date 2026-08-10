'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import MainLayout from '../../components/layout/MainLayout';

export default function MainGroup({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { token } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!token) {
            router.push('/login');
        }
    }, [token, router]);

    // Hindari hydration mismatch
    if (!mounted) return null;

    if (!token) return null;

    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}
