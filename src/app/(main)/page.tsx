'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const roleName = user?.role?.name;
        if (roleName === 'SECURITY') router.replace('/gate');
        else if (roleName === 'OPERATOR_QC') router.replace('/qc');
        else if (roleName === 'FORKLIFT') router.replace('/putaway');
        else if (roleName === 'PICKER') router.replace('/picking');
        else if (roleName === 'CHECKER') router.replace('/shipping');
    }, [user, router]);

    return (
        <div className="h-full">
            <h1 className="text-2xl font-bold mb-4 text-slate-800">Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                <p className="text-slate-600 mb-2">Welcome back, <span className="font-semibold text-blue-600">{user?.name || 'User'}</span>!</p>
                <p className="text-slate-500 text-sm">You are logged in as {user?.role?.name || 'User'}.</p>
            </div>
        </div>
    );
}
