'use client';

import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, Input, List, Tag, message, Spin, Empty, Alert } from 'antd';
import { CheckCircleOutlined, CarOutlined, SearchOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import dayjs from 'dayjs';
import ModalCreate from '../../(main)/inbound/incoming-receive/_components/modal-create';

const { Title, Text } = Typography;

export default function SecurityGatePortal() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [manifestData, setManifestData] = useState<any>(null);
    const [searchDone, setSearchDone] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        setSearchDone(true);
        setManifestData(null);
        try {
            const res = await api.get(`/manifest/search/${encodeURIComponent(searchQuery.trim())}`);
            if (res.data) {
                setManifestData(res.data);
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
            await api.post(`/manifest/${manifestData.id}/gate-in`);
            message.success(`Truk dengan Manifest ${manifestData.manifestNo} berhasil diterima!`);
            // Refresh data
            handleSearch();
        } catch (error: any) {
            message.error('Gagal memproses kedatangan truk');
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <Title level={2} style={{ margin: 0, color: '#063834' }}>
                        <CarOutlined className="mr-3" /> 
                        Gate / Security Portal
                    </Title>
                    <Text type="secondary" className="text-lg">Verifikasi & Catat kedatangan truk berdasarkan No. Manifest.</Text>
                </div>
            </div>

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
                                            <Text type="secondary">Lokasi Dock</Text>
                                            <div className="text-lg font-semibold">{manifestData.dockCode}</div>
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
                                <CarOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
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

            <ModalCreate
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    // We don't auto-fetch because they need to search it, or we could set it as searchQuery
                }}
            />
        </div>
    );
}
