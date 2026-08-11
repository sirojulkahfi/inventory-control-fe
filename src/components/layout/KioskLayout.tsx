'use client';

import React from 'react';
import { Layout, Button, Typography, Space } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function KioskLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Header style={{ 
                background: '#fff', 
                padding: '0 24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                height: '70px',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={100}
                        height={40}
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                    <Text strong style={{ fontSize: '18px', color: '#063834', display: 'none' }} className="sm:inline-block">
                        | KIOSK PORTAL
                    </Text>
                </div>
                
                <Space size="large">
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <Text strong>{user?.name || 'Operator'}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{user?.role?.name || 'Staff'}</Text>
                    </div>
                    <Button 
                        type="primary" 
                        danger 
                        icon={<LogoutOutlined />} 
                        onClick={handleLogout}
                        size="large"
                    >
                        Logout
                    </Button>
                </Space>
            </Header>
            <Content style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {children}
            </Content>
        </Layout>
    );
}
