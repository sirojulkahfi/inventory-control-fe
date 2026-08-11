"use client";

import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import {
    DashboardOutlined,
    DatabaseOutlined,
    AppstoreOutlined,
    SwapOutlined,
    SettingOutlined,
    ImportOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
type MenuItem = Required<MenuProps>['items'][number];

function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem {
    return { key, icon, children, label } as MenuItem;
}

interface SidebarProps {
    collapsed: boolean;
    onCollapse: (value: boolean) => void;
}

export default function Sidebar({ collapsed, onCollapse }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const roleName = user?.role?.name || '';
    
    // RBAC logic helper: Dynamic Permission based
    const hasPermission = (permissionString: string) => {
        if (!user?.role) return false;
        if (user.role.name === 'SUPER_ADMIN') return true; // Super admin bebas
        return user.role.permissions?.includes(permissionString);
    };

    const getOpenKeys = () => {
        if (pathname.includes('/master-data')) return ['master-data'];
        if (pathname.includes('/inventory')) return ['inventory'];
        if (pathname.includes('/booking')) return ['booking'];
        if (pathname.includes('/inbound')) return ['inbound'];
        if (pathname.includes('/outbound')) return ['outbound'];
        if (pathname.includes('/system')) return ['system'];
        return [];
    };

    const getDynamicItems = (): MenuItem[] => {
        const items: MenuItem[] = [
            getItem(<Link href="/">Dashboard</Link>, '/', <DashboardOutlined />),
        ];

        // MASTER DATA
        if (hasPermission('VIEW CUSTOMER') || hasPermission('VIEW ITEM') || hasPermission('VIEW LOCATION')) {
            const masterDataChildren: MenuItem[] = [];
            if (hasPermission('VIEW CUSTOMER')) masterDataChildren.push(getItem(<Link href="/master-data/customer">Customer</Link>, '/master-data/customer'));
            if (hasPermission('VIEW ITEM')) masterDataChildren.push(getItem(<Link href="/master-data/item">Item (SKU)</Link>, '/master-data/item'));
            if (hasPermission('VIEW LOCATION')) masterDataChildren.push(getItem(<Link href="/master-data/location">Location</Link>, '/master-data/location'));
            items.push(getItem('Master Data', 'master-data', <DatabaseOutlined />, masterDataChildren));
        }

        // CUSTOMER BOOKING
        if (hasPermission('VIEW BOOKING_LIST') || hasPermission('CREATE ASN')) {
            const bookingChildren: MenuItem[] = [];
            if (hasPermission('CREATE ASN')) bookingChildren.push(getItem(<Link href="/booking/create-asn">Buat ASN</Link>, '/booking/create-asn'));
            if (hasPermission('VIEW BOOKING_LIST')) bookingChildren.push(getItem(<Link href="/booking/list">Daftar ASN & Arrival (Security)</Link>, '/booking/list'));
            items.push(getItem('Customer Booking', 'booking', <AppstoreOutlined />, bookingChildren));
        }

        // INBOUND & PUTAWAY
        if (hasPermission('VIEW INBOUND_RECEIVE') || hasPermission('VIEW PUTAWAY')) {
            const inboundChildren: MenuItem[] = [];
            if (hasPermission('VIEW INBOUND_RECEIVE')) {
                inboundChildren.push(getItem(<Link href="/inbound/incoming-receive">Manifest / DO (Security)</Link>, '/inbound/incoming-receive'));
                inboundChildren.push(getItem(<Link href="/inbound/receive">Receiving & QC (Operator)</Link>, '/inbound/receive'));
            }
            if (hasPermission('VIEW PUTAWAY')) inboundChildren.push(getItem(<Link href="/inbound/putaway">Putaway Task (Forklift)</Link>, '/inbound/putaway'));
            items.push(getItem('Inbound (Security & QC)', 'inbound', <ImportOutlined />, inboundChildren));
        }

        // INVENTORY
        if (hasPermission('VIEW INVENTORY_STOCK')) {
            items.push(getItem('Inventory', 'inventory', <DatabaseOutlined />, [
                getItem(<Link href="/inventory/stock">Stock View</Link>, '/inventory/stock'),
            ]));
        }

        // OUTBOUND & SHIPPING
        if (hasPermission('VIEW OUTBOUND_REQUEST') || hasPermission('VIEW OUTBOUND_PICKING') || hasPermission('VIEW OUTBOUND_SHIPPING')) {
            const outboundChildren: MenuItem[] = [];
            if (hasPermission('VIEW OUTBOUND_REQUEST')) outboundChildren.push(getItem(<Link href="/outbound/request">Request Kirim (Customer)</Link>, '/outbound/request'));
            if (hasPermission('VIEW OUTBOUND_PICKING')) outboundChildren.push(getItem(<Link href="/outbound/picking">Pick List (Picker)</Link>, '/outbound/picking'));
            if (hasPermission('VIEW OUTBOUND_SHIPPING')) outboundChildren.push(getItem(<Link href="/outbound/shipping">Shipping & DO (Checker)</Link>, '/outbound/shipping'));
            items.push(getItem('Outbound & Shipping', 'outbound', <SwapOutlined />, outboundChildren));
        }

        // SYSTEM ADMIN
        if (hasPermission('VIEW SYSTEM_USERS') || hasPermission('VIEW SYSTEM_ROLES') || hasPermission('VIEW SYSTEM_PERMISSIONS') || hasPermission('VIEW SYSTEM_AUDIT_LOGS') || hasPermission('VIEW SYSTEM_SETTINGS')) { 
            const systemChildren: MenuItem[] = [];
            if (hasPermission('VIEW SYSTEM_USERS')) systemChildren.push(getItem(<Link href="/system/users">Users</Link>, '/system/users'));
            if (hasPermission('VIEW SYSTEM_ROLES')) systemChildren.push(getItem(<Link href="/system/roles">Roles</Link>, '/system/roles'));
            if (hasPermission('VIEW SYSTEM_PERMISSIONS')) systemChildren.push(getItem(<Link href="/system/permissions">Permissions</Link>, '/system/permissions'));
            if (hasPermission('VIEW SYSTEM_AUDIT_LOGS')) systemChildren.push(getItem(<Link href="/system/audit-logs">Audit Logs</Link>, '/system/audit-logs'));
            if (hasPermission('VIEW SYSTEM_SETTINGS')) systemChildren.push(getItem(<Link href="/system/settings">Settings</Link>, '/system/settings'));
            items.push(getItem('System', 'system', <SettingOutlined />, systemChildren));
        }

        return items;
    };

    if (!mounted) return <Sider width={260} theme="dark" />;

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
                items={getDynamicItems()}
                style={{ borderRight: 0, background: 'transparent' }}
            />
        </Sider>
    );
}