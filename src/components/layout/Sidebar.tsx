"use client";

import React from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    DashboardOutlined,
    DatabaseOutlined,
    AppstoreOutlined,
    SwapOutlined,
    CheckSquareOutlined,
    BellOutlined,
    SettingOutlined,
    ImportOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
type MenuItem = Required<MenuProps>['items'][number];

function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
    return { key, icon, children, label } as MenuItem;
}

const items: MenuItem[] = [
    getItem(<Link href="/">Dashboard</Link>, '/', <DashboardOutlined />),

    // 1. INBOUND
    getItem('Inbound', 'inbound', <ImportOutlined />, [
        getItem(<Link href="/inbound/incoming-receive">Incoming Receive</Link>, '/inbound/incoming-receive'),
    ]),

    // 2. SYSTEM ADMIN
    getItem('System', 'system', <SettingOutlined />, [
        getItem(<Link href="/system/users">Users</Link>, '/system/users'),
        getItem(<Link href="/system/roles">Roles</Link>, '/system/roles'),
        getItem(<Link href="/system/permissions">Permissions</Link>, '/system/permissions'),
        getItem(<Link href="/system/audit-logs">Audit Logs</Link>, '/system/audit-logs'),
        getItem(<Link href="/system/settings">Settings</Link>, '/system/settings'),
    ]),
];

interface SidebarProps {
    collapsed: boolean;
    onCollapse: (value: boolean) => void;
}

export default function Sidebar({ collapsed, onCollapse }: SidebarProps) {
    const pathname = usePathname();

    const getOpenKeys = () => {
        if (pathname.includes('/master-data')) return ['master-data'];
        if (pathname.includes('/inventory')) return ['inventory'];
        if (pathname.includes('/transactions')) return ['transactions'];
        if (pathname.includes('/approvals')) return ['approvals'];
        if (pathname.includes('/notifications')) return ['notifications'];
        if (pathname.includes('/system')) return ['system'];
        return [];
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            width={260}
            collapsedWidth={80}
            theme="dark"
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1001,
                background: 'linear-gradient(180deg, #063834 0%, #032421 100%)',
            }}
        >
            <div className={`flex justify-center items-center h-16 border-b border-white/10 transition-all duration-300 ${collapsed ? 'px-1 py-2' : 'p-4'}`}>
                <div className="relative w-full h-full flex justify-center items-center">
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={collapsed ? 64 : 160}
                        height={collapsed ? 48 : 50}
                        className={`object-contain transition-all duration-300 ${collapsed ? 'scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`}
                        priority
                    />
                </div>
            </div>

            <Menu
                theme="dark"
                selectedKeys={[pathname]}
                defaultOpenKeys={getOpenKeys()}
                mode="inline"
                items={items}
                style={{ borderRight: 0, background: 'transparent' }}
            />
        </Sider>
    );
}