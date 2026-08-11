'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore'; // Pengganti Redux

function LoginForm() {
    const router = useRouter();
    // Ambil fungsi login dan status token dari Zustand
    const { login, token } = useAuthStore();
    const searchParams = useSearchParams();

    // Di BE Prisma, login menggunakan 'username'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Cek apakah user sudah login, jika ya, lempar ke dashboard
    useEffect(() => {
        if (token) {
            router.push('/');
        }
    }, [token, router]);

    // Handle pesan session expired dari URL
    useEffect(() => {
        sessionStorage.removeItem('processing401');
        if (searchParams.get('sessionExpired') === 'true') {
            setSessionExpired(true);
            window.history.replaceState({}, '', '/login');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        setLoading(true);
        setError(null);
        try {
            const res = await authService.login({ username, password });
            
            // Simpan token & user
            login(res.accessToken, res.user);
            
            // Redirect based on role (Kiosk Mode Portals)
            const roleName = res.user?.role?.name;
            if (roleName === 'SECURITY') {
                window.location.href = '/gate';
            } else if (roleName === 'OPERATOR_QC') {
                window.location.href = '/qc';
            } else if (roleName === 'FORKLIFT') {
                window.location.href = '/putaway';
            } else if (roleName === 'PICKER') {
                window.location.href = '/picking';
            } else if (roleName === 'CHECKER') {
                window.location.href = '/shipping';
            } else {
                // Admin, Customer, etc. go to main dashboard
                window.location.href = '/';
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Terjadi kesalahan pada server. Pastikan username/password benar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Image dari public/images/main-bg.jpg */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-70"
                style={{ backgroundImage: `url(/images/main-bg.jpg)` }}
            />

            {/* Overlay */}
            {/* <div className="absolute inset-0 z-0 bg-blue-900/40 backdrop-blur-sm" /> */}

            {/* Glassmorphism Card */}
            <div className="relative z-10 w-[95%] sm:w-[80%] md:w-[50%] lg:w-[35%] xl:w-[30%] p-6 sm:p-8 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md bg-white/10">

                {/* Logo / message area */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white tracking-widest mb-2">
                        RJL - 2026
                    </h2>
                    <h2 className="text-sm font-medium text-transparent bg-clip-text bg-linear-to-r from-blue-300 via-purple-300 to-pink-300 tracking-wide drop-shadow-lg">
                        App Test System
                    </h2>
                </div>

                {/* Session Expired Alert */}
                {sessionExpired && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-100 text-sm backdrop-blur-sm flex items-center justify-between">
                        <span>⚠️ Your session has expired. Please login again.</span>
                        <button onClick={() => setSessionExpired(false)} className="ml-2 text-amber-200 hover:text-white">✕</button>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-100 text-sm text-center backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-blue-100 uppercase tracking-wide ml-1">
                            Username
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200 group-focus-within:text-white transition-colors">
                                <UserOutlined />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-black/30 transition-all duration-200 shadow-inner backdrop-blur-sm"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-blue-100 uppercase tracking-wide ml-1">
                            Password
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200 group-focus-within:text-white transition-colors">
                                <LockOutlined />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:bg-black/30 transition-all duration-200 shadow-inner backdrop-blur-sm"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg backdrop-blur-sm border border-blue-400/50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : 'Login'}
                    </button>
                </form>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 w-full text-center z-10 px-4 flex flex-col items-center gap-3">
                <p className="text-xs text-white/60 drop-shadow-md">
                    Copyright © 2026 RJL DevOps
                    <br />
                    Version 1.0.0
                </p>
            </div>
        </div>
    );
}

// Suspense WAJIB membungkus useSearchParams di Next.js App Router
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
            <LoginForm />
        </Suspense>
    );
}