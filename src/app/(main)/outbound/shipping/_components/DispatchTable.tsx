"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Typography, Space, Modal, Form, Input, Tag, message } from 'antd';
import { SendOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Text } = Typography;

const DispatchTable = forwardRef((props, ref) => {
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

    useImperativeHandle(ref, () => ({
        fetchShipping
    }));

    useEffect(() => {
        fetchShipping();
    }, []);

    const columns = [
        {
            title: 'No. Surat Jalan (DO)',
            dataIndex: 'doNumber',
            key: 'doNumber',
        },
        {
            title: 'No. Pesanan',
            key: 'orderNo',
            render: (_: any, record: any) => <Text strong>{record.order?.orderNo || '-'}</Text>,
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (_: any, record: any) => record.order?.customer?.name || '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => (
                <Tag color={text === 'PREPARING' ? 'orange' : 'green'}>{text}</Tag>
            ),
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="default" icon={<FileTextOutlined />}>Cetak DO</Button>
                    <Button 
                        type="primary" 
                        icon={<SendOutlined />} 
                        onClick={() => {
                            setSelectedId(record.id);
                            setSelectedDo(record.doNumber);
                            setIsModalOpen(true);
                        }}
                        disabled={record.status === 'DISPATCHED'}
                    >
                        Dispatch Truk
                    </Button>
                </Space>
            ),
        },
    ];

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

    return (
        <>
            <Table dataSource={data} columns={columns} pagination={{ pageSize: 10 }} rowKey="id" loading={loading} />
            
            <Modal 
                title={`Dispatch Pengiriman - ${selectedDo}`} 
                open={isModalOpen} 
                onOk={handleDispatch} 
                onCancel={() => setIsModalOpen(false)}
                okText="Konfirmasi Dispatch"
            >
                <div className="bg-blue-50 p-4 rounded mb-4">
                    <Text>Pastikan semua barang sudah dimuat ke dalam kontainer/truk sebelum melakukan konfirmasi dispatch.</Text>
                </div>
                <Form form={form} layout="vertical">
                    <Form.Item label="Nama Ekspedisi / Vendor Logistik" name="carrierName" rules={[{ required: true }]}>
                        <Input placeholder="Contoh: PT Lintas Logistik" />
                    </Form.Item>
                    <Form.Item label="Plat Nomor Truk" name="truckNo" rules={[{ required: true }]}>
                        <Input placeholder="Contoh: B 1234 CD" />
                    </Form.Item>
                    <Form.Item label="Nama Supir (Opsional)" name="driverName">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
});

DispatchTable.displayName = 'DispatchTable';
export default DispatchTable;
