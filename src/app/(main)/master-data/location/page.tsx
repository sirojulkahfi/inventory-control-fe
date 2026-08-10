"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Typography, Space, Modal, Form, Input, Card, InputNumber, Row, Col, Tag, message, Breadcrumb, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';

const { Title, Text } = Typography;

export default function LocationPage() {
    const { user } = useAuthStore();
    const canCreate = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('CREATE LOCATION');
    const canEdit = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('EDIT LOCATION');
    const canDelete = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('DELETE LOCATION');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);
    const [form] = Form.useForm();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/location');
            setLocations(res.data);
        } catch (error) {
            message.error('Gagal mengambil data lokasi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                // Auto generate code LOC-zone-aisle-rack-level
                const code = `LOC-${values.zone}-${values.aisle}-${values.rack}-${values.level}`;
                
                if (editingData) {
                    await api.put(`/location/${editingData.id}`, { ...values, code });
                    message.success('Data lokasi berhasil diubah!');
                } else {
                    await api.post('/location', { ...values, code });
                    message.success('Data lokasi berhasil ditambahkan!');
                }
                setIsModalOpen(false);
                setEditingData(null);
                form.resetFields();
                fetchLocations();
            } catch (error) {
                message.error('Gagal menyimpan data lokasi');
            }
        }).catch(err => {
            console.log('Validasi gagal:', err);
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Kode Lokasi',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Zona',
            dataIndex: 'zone',
            key: 'zone',
        },
        {
            title: 'Lorong',
            dataIndex: 'aisle',
            key: 'aisle',
        },
        {
            title: 'Rak',
            dataIndex: 'rack',
            key: 'rack',
        },
        {
            title: 'Tingkat',
            dataIndex: 'level',
            key: 'level',
        },
        {
            title: 'Kapasitas (Qty)',
            dataIndex: 'capacity',
            key: 'capacity',
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
                            title="Are you sure delete this location?"
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
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Master Data' }, { title: 'Location' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={fetchLocations} />
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
                    dataSource={locations} 
                    columns={columns} 
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }} 
                />
            </Card>

            <Modal title={editingData ? "Edit Lokasi Rak" : "Tambah Lokasi Rak"} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={600}>
                <Form form={form} layout="vertical" className="mt-4">
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item label="Zona" name="zone" rules={[{ required: true }]}>
                                <Input placeholder="A" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Lorong" name="aisle" rules={[{ required: true }]}>
                                <Input placeholder="01" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Rak" name="rack" rules={[{ required: true }]}>
                                <Input placeholder="01" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label="Tingkat" name="level" rules={[{ required: true }]}>
                                <Input placeholder="01" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item label="Kapasitas Maksimal (Unit)" name="capacity" rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

