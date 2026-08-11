"use client";

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, Select, Table, Divider, message, Row, Col, Breadcrumb } from 'antd';
import { PlusOutlined, DeleteOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';

export default function RequestOutboundPage() {
    const { user } = useAuthStore();
    const [form] = Form.useForm();
    const [items, setItems] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [availableItems, setAvailableItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, itemRes] = await Promise.all([
                    api.get('/customer'),
                    api.get('/item')
                ]);
                setCustomers(custRes.data);
                setAvailableItems(itemRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (user?.customerId) {
            form.setFieldsValue({ customerId: user.customerId });
        }
    }, [user, form]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), itemId: null, requestQty: 1 }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSubmit = () => {
        form.validateFields().then(async (values) => {
            if (items.length === 0) {
                message.warning('Harap tambahkan minimal 1 barang');
                return;
            }
            try {
                const payload = {
                    orderNo: values.orderNo,
                    customerId: values.customerId,
                    items: items.map(item => ({
                        itemId: item.itemId,
                        requestQty: Number(item.requestQty)
                    }))
                };
                await api.post('/outbound', payload);
                message.success('Permintaan kirim berhasil dibuat dengan status REQUESTED');
                form.resetFields();
                setItems([]);
            } catch (error) {
                message.error('Gagal membuat request outbound');
            }
        });
    };

    const columns = [
        {
            title: 'Pilih SKU / Item',
            dataIndex: 'itemId',
            key: 'itemId',
            render: (_: any, record: any) => (
                <Select 
                    style={{ width: '100%' }} 
                    placeholder="Pilih barang (Stok Tersedia)"
                    value={record.itemId}
                    onChange={(val) => updateItem(record.id, 'itemId', val)}
                >
                    {availableItems.map(item => (
                        <Select.Option key={item.id} value={item.id}>
                            {item.code} - {item.name}
                        </Select.Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Kuantitas Permintaan',
            dataIndex: 'requestQty',
            key: 'requestQty',
            width: 200,
            render: (_: any, record: any) => (
                <Input 
                    type="number" 
                    value={record.requestQty} 
                    min={1} 
                    onChange={(e) => updateItem(record.id, 'requestQty', e.target.value)}
                />
            )
        },
        {
            title: '',
            key: 'action',
            width: 60,
            render: (_: any, record: any) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveItem(record.id)} />
            )
        }
    ];

    return (
        <div className="flex flex-col">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Outbound' }, { title: 'Request Outbound' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Batal" icon={<CloseOutlined />} onClick={() => { form.resetFields(); setItems([]); }} />
                <ButtonToolbar message="Submit Request" icon={<SendOutlined />} onClick={handleSubmit} />
            </ToolbarWrapper>

            <Card className="shadow-sm rounded-xl mt-2">
                <Form form={form} layout="vertical">
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="Customer (Pemilik Barang)" name="customerId" rules={[{ required: true }]}>
                                <Select placeholder="Pilih Customer" disabled={!!user?.customerId}>
                                    {customers.map(c => (
                                        <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Nomor Referensi (Order No)" name="orderNo" rules={[{ required: true }]}>
                                <Input placeholder="Otomatis digenerate atau input manual" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Tanggal Permintaan Kirim" name="requestDate" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Divider>Daftar Barang yang Diminta</Divider>
                    
                    <Table 
                        dataSource={items} 
                        columns={columns} 
                        pagination={false}
                        rowKey="id"
                        bordered
                        className="mb-4"
                        locale={{ emptyText: 'Belum ada barang yang ditambahkan' }}
                    />
                    
                    <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddItem}>
                        Tambah Baris Barang
                    </Button>
                </Form>
            </Card>
        </div>
    );
}
