'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Modal, Form, Input, Tag, message, Table, Row, Col } from 'antd';
import { SendOutlined, FileTextOutlined, RocketOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function ShippingPortal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [selectedDo, setSelectedDo] = useState('');
    const [selectedId, setSelectedId] = useState('');
    
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchShipping = async () => {
        setLoading(true);
        try {
            const res = await api.get('/shipping');
            setData(res.data);
        } catch (error) {
            message.error('Gagal mengambil data shipping');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipping();
    }, []);

    const handleDispatch = () => {
        form.validateFields().then(async (values) => {
            try {
                await api.put(`/shipping/${selectedId}/dispatch`, values);
                message.success(`Surat Jalan ${selectedDo} berhasil didispatch! Stok inventory otomatis terpotong.`);
                setIsModalOpen(false);
                form.resetFields();
                fetchShipping();
            } catch (error) {
                message.error('Gagal mendispatch pengiriman');
            }
        });
    };

    const columns = [
        {
            title: 'No. Surat Jalan (DO)',
            dataIndex: 'doNumber',
            key: 'doNumber',
            render: (text: string) => <Text strong className="text-lg">{text}</Text>
        },
        {
            title: 'No. Pesanan',
            key: 'orderNo',
            render: (_: any, record: any) => record.order?.orderNo || '-',
        },
        {
            title: 'Customer / Penerima',
            key: 'customer',
            render: (_: any, record: any) => record.order?.customer?.name || '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => (
                <Tag color={text === 'PREPARING' ? 'orange' : 'green'} style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Aksi (Checker)',
            key: 'action',
            width: 350,
            render: (_: any, record: any) => (
                <Space size="middle" className="w-full">
                    <Button 
                        size="large" 
                        icon={<FileTextOutlined />}
                        style={{ height: '45px', width: '130px' }}
                    >
                        Cetak DO
                    </Button>
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<SendOutlined />} 
                        onClick={() => {
                            setSelectedId(record.id);
                            setSelectedDo(record.doNumber);
                            setIsModalOpen(true);
                        }}
                        disabled={record.status === 'DISPATCHED'}
                        style={{ height: '45px', width: '150px' }}
                    >
                        DISPATCH
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <Title level={2} style={{ margin: 0, color: '#063834' }}>
                        <RocketOutlined className="mr-3" /> 
                        Shipping & DO Portal
                    </Title>
                    <Text type="secondary" className="text-lg">Cetak Delivery Order dan konfirmasi pengiriman truk.</Text>
                </div>
                <Button size="large" icon={<ReloadOutlined />} onClick={fetchShipping}>Refresh Data</Button>
            </div>

            <Card className="shadow-sm rounded-2xl" styles={{ body: { padding: 0 } }}>
                <Table 
                    dataSource={data} 
                    columns={columns} 
                    pagination={{ pageSize: 10 }} 
                    rowKey="id" 
                    loading={loading}
                    rowClassName="h-16" 
                />
            </Card>

            <Modal 
                title={<Title level={4} className="mb-0">Dispatch Pengiriman - {selectedDo}</Title>} 
                open={isModalOpen} 
                onOk={handleDispatch} 
                onCancel={() => setIsModalOpen(false)}
                okText="Konfirmasi Dispatch"
                width={600}
                centered
            >
                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 mt-4">
                    <Text className="text-base text-blue-800">
                        Pastikan semua barang sudah dimuat ke dalam kontainer/truk sebelum melakukan konfirmasi dispatch. Setelah dispatch, stok inventory akan otomatis terpotong.
                    </Text>
                </div>
                <Form form={form} layout="vertical" size="large">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item label={<Text strong>Nama Ekspedisi / Vendor Logistik</Text>} name="carrierName" rules={[{ required: true }]}>
                                <Input placeholder="Contoh: PT Lintas Logistik" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={<Text strong>Plat Nomor Truk</Text>} name="truckNo" rules={[{ required: true }]}>
                                <Input placeholder="Contoh: B 1234 CD" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={<Text strong>Nama Supir (Opsional)</Text>} name="driverName">
                                <Input placeholder="Nama supir..." />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
}
