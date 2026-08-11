"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-[80px]' : 'w-[260px]'}`}>
                <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
            </div>
            
            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
                
                <main className="flex-1 overflow-auto p-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm min-h-full">
                        {children}
                    </div>
                </main>
                
                <Footer />
            </div>
        </div>
    );
}