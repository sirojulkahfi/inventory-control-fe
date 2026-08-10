"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, Modal, Form, Input, Card, Select, message, Breadcrumb, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';

const { Title, Text } = Typography;

export default function ItemPage() {
    const { user } = useAuthStore();
    const canCreate = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('CREATE ITEM');
    const canEdit = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('EDIT ITEM');
    const canDelete = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('DELETE ITEM');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await api.get('/item');
            setItems(res.data);
        } catch (error) {
            message.error('Gagal mengambil data item');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customer');
            setCustomers(res.data);
        } catch (error) {
            console.error('Failed to fetch customers');
        }
    };

    useEffect(() => {
        fetchItems();
        fetchCustomers();
    }, []);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingData) {
                    await api.put(`/item/${editingData.id}`, values);
                    message.success('Data item berhasil diubah!');
                } else {
                    await api.post('/item', values);
                    message.success('Data item berhasil ditambahkan!');
                }
                setIsModalOpen(false);
                setEditingData(null);
                form.resetFields();
                fetchItems();
            } catch (error) {
                message.error('Gagal menyimpan data item');
            }
        }).catch(err => {
            console.log('Validasi gagal:', err);
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
        setEditingData(null);
    };

    const columns = [
        {
            title: 'SKU',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Text strong className="text-blue-600">{text}</Text>,
        },
        {
            title: 'Nama Barang',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'UOM',
            dataIndex: 'uom',
            key: 'uom',
        },
        {
            title: 'Pemilik (Customer)',
            key: 'customer',
            render: (_: any, record: any) => record.customer?.name || '-',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="small">
                    {canEdit && (
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => {
                                setEditingData(record);
                                form.setFieldsValue(record);
                                setIsModalOpen(true);
                            }}
                        />
                    )}
                    {canDelete && (
                        <Popconfirm
                            title="Are you sure delete this item?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            placement="topRight"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="flex flex-col">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Master Data' }, { title: 'Item (SKU)' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={fetchItems} />
                <ButtonToolbar message="Download CSV" icon={<DownloadOutlined />} />
                <ButtonToolbar message="Print Report" icon={<PrinterOutlined />} />
                {canCreate && (
                    <ButtonToolbar 
                        message="Add New" 
                        icon={<PlusOutlined />} 
                        type="primary" 
                        onClick={() => {
                            setEditingData(null);
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                    />
                )}
            </ToolbarWrapper>

            <Card className="shadow-sm rounded-xl overflow-hidden mt-2" styles={{ body: { padding: 0 } }}>
                <Table 
                    dataSource={items} 
                    columns={columns} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }} 
                />
            </Card>

            <Modal title={editingData ? "Edit Item" : "Tambah Item Baru"} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item label="Pemilik Barang (Customer)" name="customerId" rules={[{ required: true }]}>
                        <Select placeholder="Pilih Customer">
                            {customers.map(c => (
                                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Kode Item (SKU)" name="code" rules={[{ required: !!editingData }]}>
                        <Input placeholder="Auto-generated by System" disabled={!editingData} />
                    </Form.Item>
                    <Form.Item label="Nama Barang" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        label="UOM (Unit of Measure)" 
                        name="uom" 
                        rules={[{ required: true }]}
                        extra={<span style={{ color: '#cf1322', fontSize: '12px' }}>⚠️ Wajib gunakan satuan terkecil (contoh: PCS, KGS, BTL). Jangan gunakan satuan kemasan (BOX / PALLET) untuk menghindari selisih stok saat ada barang rusak.</span>}
                    >
                        <Select placeholder="Pilih Satuan">
                            <Select.Option value="PCS">PCS</Select.Option>
                            <Select.Option value="BOX">BOX</Select.Option>
                            <Select.Option value="PALLET">PALLET</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

