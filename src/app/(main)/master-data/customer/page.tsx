"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, Modal, Form, Input, Card, message, Breadcrumb, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';

const { Title, Text } = Typography;

export default function CustomerPage() {
    const { user } = useAuthStore();
    const canCreate = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('CREATE CUSTOMER');
    const canEdit = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('EDIT CUSTOMER');
    const canDelete = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('DELETE CUSTOMER');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);
    const [form] = Form.useForm();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/customer');
            setCustomers(res.data);
        } catch (error) {
            message.error('Gagal mengambil data customer');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingData) {
                    await api.put(`/customer/${editingData.id}`, values);
                    message.success('Data customer berhasil diubah!');
                } else {
                    await api.post('/customer', values);
                    message.success('Data customer berhasil ditambahkan!');
                }
                setIsModalOpen(false);
                setEditingData(null);
                form.resetFields();
                fetchCustomers();
            } catch (error) {
                message.error('Gagal menyimpan data customer');
            }
        }).catch(err => {
            console.log('Validasi gagal:', err);
        });
    };

    const columns = [
        {
            title: 'Kode Customer',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Text strong className="text-blue-600">{text}</Text>,
        },
        {
            title: 'Nama Customer',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Contact Person',
            dataIndex: 'contactPerson',
            key: 'contactPerson',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Telepon',
            dataIndex: 'phone',
            key: 'phone',
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
                            title="Are you sure delete this customer?"
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
        },
    ];

    return (
        <div className="flex flex-col">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Master Data' }, { title: 'Customer' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={fetchCustomers} />
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
                    dataSource={customers} 
                    columns={columns} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    rowClassName="hover:bg-slate-50 transition-colors"
                />
            </Card>

            <Modal title={editingData ? "Edit Customer" : "Tambah Customer Baru"} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item label="Kode Customer" name="code" rules={[{ required: !!editingData }]}>
                        <Input placeholder="Auto-generated by System" disabled={!editingData} />
                    </Form.Item>
                    <Form.Item label="Nama Customer" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Contact Person" name="contactPerson" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Nomor Telepon" name="phone">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
