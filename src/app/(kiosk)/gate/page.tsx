'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Input, List, Tag, message, Spin, Empty, Alert, Popconfirm, Select } from 'antd';
import { CheckCircleOutlined, TruckOutlined, SearchOutlined, AppstoreAddOutlined, LogoutOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import dayjs from 'dayjs';
import ModalCreate from '../../(main)/inbound/incoming-receive/_components/modal-create';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/useAuthStore';

const { Title, Text } = Typography;

export default function SecurityGatePortal() {
    const { user, logout } = useAuthStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [manifestData, setManifestData] = useState<any>(null);
    const [searchDone, setSearchDone] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    
    // Master data
    const [docks, setDocks] = useState([]);
    const [routes, setRoutes] = useState([]);

    // Fetch master data on mount
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [dockRes, routeRes] = await Promise.all([
                    api.get('/dock'),
                    api.get('/route')
                ]);
                // Filter only ACTIVE ones
                setDocks(dockRes.data.filter((d: any) => d.status === 'ACTIVE'));
                setRoutes(routeRes.data.filter((r: any) => r.status === 'ACTIVE'));
            } catch (error) {
                console.error('Failed to fetch dock/route master data');
            }
        };
        fetchMasterData();
    }, []);

    // New states for Dock and Route input at Gate
    const [gateDockCode, setGateDockCode] = useState('');
    const [gateRoute, setGateRoute] = useState('');
    const [gateShift, setGateShift] = useState('');

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSearchDone(true);
        setManifestData(null);
        try {
            const res = await api.get(`/manifest/search/${encodeURIComponent(searchQuery.trim())}`);
            if (res.data) {
                setManifestData(res.data);
                setGateDockCode(res.data.dockCode || '');
                setGateRoute(res.data.route || '');
                setGateShift(res.data.shift || '');
            } else {
                message.warning('Manifest tidak ditemukan di sistem.');
            }
        } catch (error) {
            message.error('Gagal mencari data manifest');
        } finally {
            setLoading(false);
        }
    };

    const handleAcknowledgeArrival = async () => {
        if (!manifestData) return;

        try {
            await api.post(`/manifest/${manifestData.id}/gate-in`, {
                dockCode: gateDockCode,
                route: gateRoute,
                userName: user?.name,
                shift: gateShift
            });
            message.success(`Truk dengan Manifest ${manifestData.manifestNo} berhasil diterima!`);
            // Refresh data
            handleSearch();
        } catch (error: any) {
            message.error('Gagal memproses kedatangan truk');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">

            {/* HEADER BATIK DENGAN ICON TRUK BESAR SEJAJAR TEKS */}
            <header className="batik-bg py-4 px-6 md:px-10 flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-4">
                    {/* Icon truk diperbesar (text-4xl md:text-5xl) agar sejajar tinggi 2 baris teks */}
                    <TruckOutlined className="text-white text-4xl md:text-5xl drop-shadow-sm flex-shrink-0" />
                    <div>
                        <h1 className="text-white text-xl md:text-2xl font-extrabold tracking-wide m-0 drop-shadow-sm">
                            Gate / Security Portal
                        </h1>
                        <p className="text-white/80 text-xs md:text-sm m-0 font-medium drop-shadow-sm mt-0.5">
                            Verifikasi & Catat kedatangan truk berdasarkan No. Manifest.
                        </p>
                    </div>
                </div>

                {/* AREA USER & LOGOUT BUTTON */}
                <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                        <div className="text-white font-bold text-sm md:text-base leading-tight drop-shadow-sm">
                            Hello, {user?.name || 'Super Admin'}
                        </div>
                        <div className="text-white/70 text-xs font-medium">
                            {user?.role?.name || 'SECURITY'}
                        </div>
                    </div>

                    <Popconfirm
                        title="Logout dari Kiosk?"
                        description="Apakah Anda yakin ingin keluar?"
                        onConfirm={() => logout()}
                        okText="Ya, Logout"
                        cancelText="Batal"
                        placement="bottomRight"
                    >
                        <Button
                            type="primary"
                            danger
                            icon={<LogoutOutlined />}
                            className="flex items-center gap-1 font-semibold shadow-sm"
                        >
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </Popconfirm>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 mt-2">
                <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                    <Row gutter={[24, 24]}>
                        <Col span={16}>
                            <Card
                                title={<Text className="text-xl font-bold">Pencarian Manifest / Surat Jalan</Text>}
                                className="shadow-sm rounded-2xl h-full"
                            >
                                <div className="flex gap-4 mb-8">
                                    <Input
                                        size="large"
                                        placeholder="Scan atau Ketik No. Manifest di sini..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onPressEnter={handleSearch}
                                        prefix={<SearchOutlined className="text-gray-400" />}
                                        style={{ fontSize: '18px', padding: '12px 20px' }}
                                    />
                                    <Button
                                        type="primary"
                                        size="large"
                                        style={{ height: 'auto', padding: '0 32px', fontSize: '18px' }}
                                        onClick={handleSearch}
                                        loading={loading}
                                    >
                                        CARI
                                    </Button>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center p-12"><Spin size="large" /></div>
                                ) : manifestData ? (
                                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                                        <Row gutter={[16, 16]} className="mb-6">
                                            <Col span={12}>
                                                <Text type="secondary">No. Manifest</Text>
                                                <div className="text-2xl font-bold">{manifestData.manifestNo}</div>
                                            </Col>
                                            <Col span={12}>
                                                <Text type="secondary">Status</Text>
                                                <div>
                                                    <Tag color={manifestData.status === 'ARRIVED' ? 'green' : 'orange'} className="text-lg px-4 py-1 mt-1">
                                                        {manifestData.status || 'PENDING'}
                                                    </Tag>
                                                </div>
                                            </Col>
                                            {manifestData.supplierName && (
                                                <Col span={12}>
                                                    <Text type="secondary">Ekspedisi / Supplier</Text>
                                                    <div className="text-lg font-semibold">{manifestData.supplierName}</div>
                                                </Col>
                                            )}
                                            {manifestData.dockCode && (
                                                <Col span={12}>
                                                    <Text type="secondary">Lokasi Dock (Asal)</Text>
                                                    <div className="text-lg font-semibold">{manifestData.dockCode}</div>
                                                </Col>
                                            )}
                                            {manifestData.route && (
                                                <Col span={12}>
                                                    <Text type="secondary">Route / Rute (Asal)</Text>
                                                    <div className="text-lg font-semibold">{manifestData.route}</div>
                                                </Col>
                                            )}
                                        </Row>

                                        <div className="mb-6">
                                            <Text strong className="text-lg mb-2 block">Daftar Muatan (ASN):</Text>
                                            {manifestData.bookings && manifestData.bookings.length > 0 ? (
                                                <List
                                                    bordered
                                                    className="bg-white"
                                                    dataSource={manifestData.bookings}
                                                    renderItem={(item: any) => (
                                                        <List.Item>
                                                            <div className="flex justify-between w-full">
                                                                <Text strong>{item.bookingNo}</Text>
                                                                <Tag color={item.status === 'ARRIVED' ? 'green' : 'blue'}>
                                                                    {item.status}
                                                                </Tag>
                                                            </div>
                                                        </List.Item>
                                                    )}
                                                />
                                            ) : (
                                                <Alert message="Tidak ada data ASN yang terikat dengan Manifest ini (Manual Receive)" type="info" showIcon />
                                            )}
                                        </div>

                                        {manifestData.status !== 'ARRIVED' && (
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
                                                <Text strong className="text-md mb-4 block text-teal-700">Tentukan Arahan Kendaraan:</Text>
                                                <Row gutter={16}>
                                                    <Col span={8}>
                                                        <div className="mb-1"><Text type="secondary">Arahkan ke Dock</Text></div>
                                                        <Select 
                                                            placeholder="Pilih Dock" 
                                                            size="large"
                                                            style={{ width: '100%' }}
                                                            value={gateDockCode || undefined}
                                                            onChange={(value) => setGateDockCode(value || '')}
                                                            allowClear
                                                            showSearch
                                                        >
                                                            {docks.map((d: any) => (
                                                                <Select.Option key={d.code} value={d.code}>{d.code} - {d.description || ''}</Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Col>
                                                    <Col span={8}>
                                                        <div className="mb-1"><Text type="secondary">Route / Jalur Parkir</Text></div>
                                                        <Select 
                                                            placeholder="Pilih Route" 
                                                            size="large"
                                                            style={{ width: '100%' }}
                                                            value={gateRoute || undefined}
                                                            onChange={(value) => setGateRoute(value || '')}
                                                            allowClear
                                                            showSearch
                                                        >
                                                            {routes.map((r: any) => (
                                                                <Select.Option key={r.code} value={r.code}>{r.code} - {r.description || ''}</Select.Option>
                                                            ))}
                                                        </Select>
                                                    </Col>
                                                    <Col span={8}>
                                                        <div className="mb-1"><Text type="secondary">Shift Kerja</Text></div>
                                                        <Select 
                                                            placeholder="Pilih Shift" 
                                                            size="large"
                                                            style={{ width: '100%' }}
                                                            value={gateShift || undefined}
                                                            onChange={(value) => setGateShift(value || '')}
                                                            allowClear
                                                        >
                                                            <Select.Option value="DAY">DAY (Siang)</Select.Option>
                                                            <Select.Option value="NIGHT">NIGHT (Malam)</Select.Option>
                                                        </Select>
                                                    </Col>
                                                </Row>
                                                <div className="mt-2 text-xs text-gray-400 italic">
                                                    *Kosongkan jika tidak diperlukan. Informasi ini akan tersimpan pada tiket manifest.
                                                </div>
                                            </div>
                                        )}

                                        {manifestData.status !== 'ARRIVED' && (
                                            <Button
                                                type="primary"
                                                size="large"
                                                icon={<CheckCircleOutlined />}
                                                style={{ backgroundColor: '#52c41a', height: '60px', fontSize: '20px', width: '100%', borderRadius: '12px' }}
                                                onClick={handleAcknowledgeArrival}
                                            >
                                                VERIFIKASI & TERIMA TRUK
                                            </Button>
                                        )}
                                    </div>
                                ) : searchDone ? (
                                    <Empty description="Data Manifest tidak ditemukan" />
                                ) : (
                                    <div className="text-center text-gray-400 py-12">
                                        <TruckOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                                        <div className="text-lg">Silakan scan dokumen surat jalan untuk memverifikasi.</div>
                                    </div>
                                )}
                            </Card>
                        </Col>

                        <Col span={8}>
                            <Card className="shadow-sm rounded-2xl h-full flex flex-col justify-center items-center text-center p-8 bg-gradient-to-b from-teal-50 to-white">
                                <AppstoreAddOutlined style={{ fontSize: '80px', color: '#008080', marginBottom: '24px' }} />
                                <Title level={3}>Truk Reguler / Non-ASN?</Title>
                                <Text type="secondary" className="mb-6 block text-lg">Buat Manifest baru secara manual jika truk tidak terdaftar di sistem.</Text>
                                <Button
                                    type="primary"
                                    size="large"
                                    style={{ height: '60px', fontSize: '20px', width: '100%', borderRadius: '12px' }}
                                    onClick={() => setIsCreateModalVisible(true)}
                                >
                                    BUAT MANIFEST BARU
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </main>

            <Footer />

            <ModalCreate
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    // We don't auto-fetch because they need to search it
                }}
            />
        </div>
    );
}