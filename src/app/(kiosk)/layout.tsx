'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function KioskLayout({ children }: { children: React.ReactNode }) {
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
        // BEDA NYA DI SINI CUY:
        // Kita GAK manggil komponen <MainLayout> sama sekali.
        // Jadi Header putih, menu 'Super Admin', dan tombol Logout bawaan gak bakal muncul!
        <div className="kiosk-wrapper min-h-screen bg-gray-50">
            {children}
        </div>
    );
}