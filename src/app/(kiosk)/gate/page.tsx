'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Space, Table, Modal, Tag, message } from 'antd';
import { CheckCircleOutlined, CarOutlined, AppstoreAddOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import dayjs from 'dayjs';
import ModalCreate from '../../(main)/inbound/incoming-receive/_components/modal-create';

const { Title, Text } = Typography;

export default function SecurityGatePortal() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/booking');
            // Only show bookings waiting for arrival
            setBookings(res.data.filter((b: any) => b.status === 'WAITING_FOR_ARRIVAL'));
        } catch (error) {
            message.error('Gagal mengambil data jadwal kedatangan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleAcknowledgeArrival = async (record: any) => {
        try {
            const receiptNo = `RCV-${Date.now()}`;
            await api.post('/inbound-receive', {
                receiptNo,
                bookingId: record.id
            });
            message.success(`Truk untuk ASN ${record.bookingNo} berhasil diterima!`);
            fetchBookings();
        } catch (error) {
            message.error('Gagal memproses kedatangan truk');
        }
    };

    const columns = [
        { title: 'No. ASN', dataIndex: 'bookingNo', key: 'bookingNo', render: (t: string) => <Text strong className="text-lg">{t}</Text> },
        { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
        { title: 'Rencana Tiba', dataIndex: 'expectedDate', key: 'expectedDate', render: (t: string) => dayjs(t).format('DD MMM YYYY') },
        {
            title: 'Aksi (Klik Jika Truk Tiba)',
            key: 'action',
            width: 250,
            render: (_: any, record: any) => (
                <Button 
                    type="primary" 
                    size="large"
                    icon={<CheckCircleOutlined />} 
                    style={{ backgroundColor: '#52c41a', height: '50px', fontSize: '18px', width: '100%' }}
                    onClick={() => handleAcknowledgeArrival(record)}
                >
                    TERIMA TRUK
                </Button>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <Title level={2} style={{ margin: 0, color: '#063834' }}>
                        <CarOutlined className="mr-3" /> 
                        Gate / Security Portal
                    </Title>
                    <Text type="secondary" className="text-lg">Catat kedatangan truk dan input surat jalan/manifest.</Text>
                </div>
                <Button size="large" icon={<ReloadOutlined />} onClick={fetchBookings}>Refresh Data</Button>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={16}>
                    <Card 
                        title={<Text className="text-xl font-bold">Jadwal Truk Datang (ASN)</Text>} 
                        className="shadow-sm rounded-2xl h-full"
                        styles={{ body: { padding: 0 } }}
                    >
                        <Table 
                            columns={columns} 
                            dataSource={bookings} 
                            rowKey="id" 
                            loading={loading}
                            pagination={false}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card className="shadow-sm rounded-2xl h-full flex flex-col justify-center items-center text-center p-8 bg-gradient-to-b from-teal-50 to-white">
                        <AppstoreAddOutlined style={{ fontSize: '80px', color: '#008080', marginBottom: '24px' }} />
                        <Title level={3}>Truk Reguler / Non-ASN?</Title>
                        <Text type="secondary" className="mb-6 block text-lg">Input Surat Jalan atau Manifest manual di sini.</Text>
                        <Button 
                            type="primary" 
                            size="large" 
                            style={{ height: '60px', fontSize: '20px', width: '100%', borderRadius: '12px' }}
                            onClick={() => setIsCreateModalVisible(true)}
                        >
                            INPUT MANIFEST BARU
                        </Button>
                    </Card>
                </Col>
            </Row>

            <ModalCreate
                visible={isCreateModalVisible}
                onClose={() => setIsCreateModalVisible(false)}
                onSuccess={() => {
                    // Refresh not strictly necessary for bookings, but good practice
                    fetchBookings();
                }}
            />
        </div>
    );
}
