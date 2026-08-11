"use client";

import React, { useEffect, useState } from 'react';
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
    DownOutlined,
    RightOutlined
} from '@ant-design/icons';
import { cn } from '@/lib/utils';

interface SidebarProps {
    collapsed: boolean;
    onCollapse: (value: boolean) => void;
}

interface MenuItem {
    key: string;
    label: string | React.ReactNode;
    icon?: React.ReactNode;
    href?: string;
    children?: MenuItem[];
}

export default function Sidebar({ collapsed, onCollapse }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);

    // When pathname changes, ensure the relevant parent menu is open (additive, doesn't close others)
    useEffect(() => {
        const keysToOpen: string[] = [];
        if (pathname.includes('/master-data')) keysToOpen.push('master-data');
        if (pathname.includes('/inventory')) keysToOpen.push('inventory');
        if (pathname.includes('/booking')) keysToOpen.push('customer-portal');

        // PERBAIKAN DI SINI:
        // Menu inbound akan dibuka JIKA ada '/inbound' TAPI BUKAN saat buka '/inbound/booking'
        if (pathname.includes('/inbound') && !pathname.includes('/inbound/booking')) {
            keysToOpen.push('inbound');
        }

        if (pathname.includes('/outbound')) keysToOpen.push('outbound');
        if (pathname.includes('/system')) keysToOpen.push('system');

        if (keysToOpen.length > 0) {
            setOpenMenus(prev => {
                const merged = new Set([...prev, ...keysToOpen]);
                return Array.from(merged);
            });
        }
    }, [pathname]);

    const hasPermission = (permissionString: string) => {
        if (!user?.role) return false;
        if (user.role.name === 'SUPER_ADMIN') return true;
        return user.role.permissions?.includes(permissionString);
    };

    const getDynamicItems = (): MenuItem[] => {
        const items: MenuItem[] = [
            { key: '/', label: 'Dashboard', icon: <DashboardOutlined />, href: '/' },
        ];

        if (hasPermission('VIEW CUSTOMER') || hasPermission('VIEW ITEM') || hasPermission('VIEW LOCATION')) {
            const masterDataChildren: MenuItem[] = [];
            if (hasPermission('VIEW CUSTOMER')) masterDataChildren.push({ key: '/master-data/customer', label: 'Customer', href: '/master-data/customer' });
            if (hasPermission('VIEW ITEM')) masterDataChildren.push({ key: '/master-data/item', label: 'Item (SKU)', href: '/master-data/item' });
            if (hasPermission('VIEW LOCATION')) masterDataChildren.push({ key: '/master-data/location', label: 'Location', href: '/master-data/location' });
            masterDataChildren.push({ key: '/master-data/dock', label: 'Dock', href: '/master-data/dock' });
            masterDataChildren.push({ key: '/master-data/route', label: 'Route', href: '/master-data/route' });
            items.push({ key: 'master-data', label: 'Master Data', icon: <DatabaseOutlined />, children: masterDataChildren });
        }

        if (hasPermission('VIEW BOOKING_LIST') || hasPermission('CREATE ASN') || !!user?.customerId) {
            const bookingChildren: MenuItem[] = [
                { key: '/inbound/booking', label: 'Manajemen ASN', href: '/inbound/booking' }
            ];
            items.push({ key: 'customer-portal', label: 'Customer Portal', icon: <AppstoreOutlined />, children: bookingChildren });
        }

        if (hasPermission('VIEW INBOUND_RECEIVE') || hasPermission('VIEW PUTAWAY')) {
            const inboundChildren: MenuItem[] = [];
            if (hasPermission('VIEW INBOUND_RECEIVE')) {
                inboundChildren.push({ key: '/inbound/incoming-receive', label: 'Manifest / DO (Security)', href: '/inbound/incoming-receive' });
                inboundChildren.push({ key: '/inbound/receive', label: 'Receiving & QC (Operator)', href: '/inbound/receive' });
                inboundChildren.push({ key: '/inbound/print-lpn', label: 'Print LPN', href: '/inbound/print-lpn' });
            }
            if (hasPermission('VIEW PUTAWAY')) inboundChildren.push({ key: '/inbound/putaway', label: 'Putaway Task (Forklift)', href: '/inbound/putaway' });
            items.push({ key: 'inbound', label: 'Inbound (Security & QC)', icon: <ImportOutlined />, children: inboundChildren });
        }

        if (hasPermission('VIEW INVENTORY_STOCK')) {
            items.push({
                key: 'inventory', label: 'Inventory', icon: <DatabaseOutlined />, children: [
                    { key: '/inventory/stock', label: 'Stock View', href: '/inventory/stock' }
                ]
            });
        }

        if (hasPermission('VIEW OUTBOUND_REQUEST') || hasPermission('VIEW OUTBOUND_PICKING') || hasPermission('VIEW OUTBOUND_SHIPPING')) {
            const outboundChildren: MenuItem[] = [];
            if (hasPermission('VIEW OUTBOUND_REQUEST')) outboundChildren.push({ key: '/outbound/request', label: 'Request Kirim (Customer)', href: '/outbound/request' });
            if (hasPermission('VIEW OUTBOUND_PICKING')) outboundChildren.push({ key: '/outbound/picking', label: 'Pick List (Picker)', href: '/outbound/picking' });
            if (hasPermission('VIEW OUTBOUND_SHIPPING')) outboundChildren.push({ key: '/outbound/shipping', label: 'Shipping & DO (Checker)', href: '/outbound/shipping' });
            items.push({ key: 'outbound', label: 'Outbound & Shipping', icon: <SwapOutlined />, children: outboundChildren });
        }

        if (hasPermission('VIEW SYSTEM_USERS') || hasPermission('VIEW SYSTEM_ROLES') || hasPermission('VIEW SYSTEM_PERMISSIONS') || hasPermission('VIEW SYSTEM_AUDIT_LOGS') || hasPermission('VIEW SYSTEM_SETTINGS')) {
            const systemChildren: MenuItem[] = [];
            if (hasPermission('VIEW SYSTEM_USERS')) systemChildren.push({ key: '/system/users', label: 'Users', href: '/system/users' });
            if (hasPermission('VIEW SYSTEM_ROLES')) systemChildren.push({ key: '/system/roles', label: 'Roles', href: '/system/roles' });
            if (hasPermission('VIEW SYSTEM_PERMISSIONS')) systemChildren.push({ key: '/system/permissions', label: 'Permissions', href: '/system/permissions' });
            if (hasPermission('VIEW SYSTEM_AUDIT_LOGS')) systemChildren.push({ key: '/system/audit-logs', label: 'Audit Logs', href: '/system/audit-logs' });
            if (hasPermission('VIEW SYSTEM_SETTINGS')) systemChildren.push({ key: '/system/settings', label: 'Settings', href: '/system/settings' });
            items.push({ key: 'system', label: 'System', icon: <SettingOutlined />, children: systemChildren });
        }

        return items;
    };

    const toggleMenu = (key: string) => {
        setOpenMenus(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    if (!mounted) return <aside className={`fixed left-0 top-0 bottom-0 z-[1001] bg-[#063834] ${collapsed ? 'w-[80px]' : 'w-[260px]'}`} />;

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 bottom-0 z-[1001] transition-all duration-300 flex flex-col",
                "bg-gradient-to-b from-[#063834] to-[#032421]",
                collapsed ? 'w-[80px]' : 'w-[260px]'
            )}
        >
            {/* Header / Logo Area */}
            <div className={cn("flex-shrink-0 flex justify-center items-center h-16 border-b border-white/10 transition-all duration-300", collapsed ? 'px-1 py-2' : 'p-4')}>
                <div className="relative w-full h-full flex justify-center items-center">
                    <Image
                        src="/images/logo.png"
                        alt="Logo"
                        width={collapsed ? 64 : 160}
                        height={collapsed ? 48 : 50}
                        className={cn("object-contain transition-all duration-300", collapsed ? 'scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : '')}
                        priority
                    />
                </div>
            </div>

            {/* Nav Menu Area (DI SINI PENAMBAHAN CLASS BUAT HIDE SCROLLBAR) */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {getDynamicItems().map((item) => (
                    <div key={item.key} className="w-full">
                        {item.children ? (
                            <div className="w-full flex flex-col">
                                <button
                                    onClick={() => {
                                        if (collapsed) onCollapse(false);
                                        toggleMenu(item.key);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-6 py-2.5 transition-colors text-sm font-medium outline-none",
                                        openMenus.includes(item.key) && !collapsed
                                            ? "!text-white"
                                            : "!text-gray-300 hover:!text-white hover:bg-white/5"
                                    )}
                                >
                                    <span className="flex-shrink-0 flex items-center justify-center w-5">{item.icon}</span>
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 text-left">{item.label}</span>
                                            <span className="text-[10px] transition-transform duration-300">
                                                {openMenus.includes(item.key) ? <DownOutlined /> : <RightOutlined />}
                                            </span>
                                        </>
                                    )}
                                </button>

                                <div
                                    className={cn(
                                        "grid transition-all duration-300 ease-in-out",
                                        openMenus.includes(item.key) && !collapsed
                                            ? "grid-rows-[1fr] opacity-100"
                                            : "grid-rows-[0fr] opacity-0"
                                    )}
                                >
                                    <div className="overflow-hidden">
                                        <div className="bg-black/30 w-full py-2 flex flex-col space-y-0.5 mt-1 mb-2">
                                            {item.children.map(child => (
                                                <Link
                                                    key={child.key}
                                                    href={child.href || '#'}
                                                    className={cn(
                                                        "block w-full pl-14 pr-6 py-2.5 text-xs transition-colors",
                                                        pathname === child.href
                                                            ? "!text-white bg-white/10 font-semibold border-r-[3px] border-white shadow-inner"
                                                            : "!text-gray-400 hover:!text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                href={item.href || '#'}
                                className={cn(
                                    "w-full flex items-center gap-3 px-6 py-2.5 transition-colors text-sm font-medium outline-none",
                                    pathname === item.href
                                        ? "bg-white/20 !text-white shadow-sm border-r-[3px] border-white"
                                        : "!text-gray-300 hover:!text-white hover:bg-white/5"
                                )}
                            >
                                <span className="flex-shrink-0 flex items-center justify-center w-5">{item.icon}</span>
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}