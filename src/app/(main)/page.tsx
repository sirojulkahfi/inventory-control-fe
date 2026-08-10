'use client';

import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
    const { user } = useAuthStore();

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
