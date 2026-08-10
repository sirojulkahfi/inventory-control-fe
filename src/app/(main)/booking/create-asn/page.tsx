"use client";

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, Select, Typography, Table, Space, Row, Col, Divider, message, Breadcrumb } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';

import { useAuthStore } from '@/store/useAuthStore';

export default function CreateASNPage() {
    const [form] = Form.useForm();
    const { user } = useAuthStore();
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
        if (user?.customerId) {
            form.setFieldsValue({ customerId: user.customerId });
        }
    }, [user]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), itemId: null, expectedQty: 1 }]);
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
                    data: {
                        bookingNo: values.bookingNo,
                        customerId: values.customerId,
                        expectedDate: values.expectedDate.toISOString(),
                    },
                    items: items.map(item => ({
                        itemId: item.itemId,
                        expectedQty: Number(item.expectedQty)
                    }))
                };
                await api.post('/booking', payload);
                message.success('ASN berhasil dibuat dengan status Waiting for Arrival');
                form.resetFields();
                setItems([]);
            } catch (error) {
                message.error('Gagal membuat ASN');
            }
        }).catch(err => {
            // Biarkan Antd menampilkan error validasi
            console.log('Validasi gagal:', err);
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
                    placeholder="Pilih barang..."
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
            title: 'Rencana Kuantitas',
            dataIndex: 'expectedQty',
            key: 'expectedQty',
            width: 200,
            render: (_: any, record: any) => (
                <Input 
                    type="number" 
                    value={record.expectedQty} 
                    min={1} 
                    onChange={(e) => updateItem(record.id, 'expectedQty', e.target.value)}
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
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Booking' }, { title: 'Create ASN' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Batal" icon={<CloseOutlined />} onClick={() => { form.resetFields(); setItems([]); }} />
                <ButtonToolbar message="Submit ASN" icon={<SendOutlined />} onClick={handleSubmit} />
            </ToolbarWrapper>

            <Card className="shadow-sm rounded-xl">
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
                        <Col span={12}>
                            <Form.Item label="ASN Number" name="bookingNo">
                                <Input placeholder="Auto-generated by System" disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Rencana Kedatangan" name="expectedDate" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Divider>Daftar Barang (Item)</Divider>
                    
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

