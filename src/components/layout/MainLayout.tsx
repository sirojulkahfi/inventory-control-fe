"use client";

import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const { Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
            
            <Layout style={{ 
                marginLeft: collapsed ? 80 : 260, 
                transition: 'margin-left 0.2s ease',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
                
                {/* Margin disesuaikan: atas 24px, kiri-kanan 24px, bawah 24px */}
                <Content style={{ 
                    margin: '24px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div
                        style={{
                            flex: 1, 
                            padding: 24,
                            background: '#ffffff',
                            borderRadius: 12,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                            overflow: 'hidden' 
                        }}
                    >
                        {children}
                    </div>
                </Content>
                
                <Footer />
            </Layout>
        </Layout>
    );
}