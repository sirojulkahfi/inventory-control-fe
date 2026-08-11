'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, Form, Select, DatePicker, Input, Row, Col, Divider, message, Space, Popconfirm } from 'antd';
import { Breadcrumb } from 'antd';
import { EditOutlined, DeleteOutlined, ReloadOutlined, CloseOutlined, PlusOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';

export default function BookingListPage() {
    const { user } = useAuthStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // For Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingData, setEditingData] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [availableItems, setAvailableItems] = useState<any[]>([]);

    const canEdit = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('EDIT BOOKING');
    const canDelete = user?.role?.name === 'SUPER_ADMIN' || user?.role?.permissions?.includes('DELETE BOOKING');

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/booking');
            setBookings(res.data);
        } catch (error) {
            message.error('Gagal memuat data booking');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customer');
            setCustomers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchItems = async () => {
        try {
            const res = await api.get('/item');
            setAvailableItems(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchCustomers();
        fetchItems();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/booking/${id}`);
            message.success('ASN berhasil dibatalkan/dihapus');
            fetchBookings();
        } catch (error) {
            message.error('Gagal menghapus ASN');
        }
    };

    const openEditModal = (record: any) => {
        setEditingData(record);
        form.setFieldsValue({
            customerId: record.customerId,
            bookingNo: record.bookingNo,
            expectedDate: dayjs(record.expectedDate)
        });
        const mappedItems = record.items.map((i: any) => ({
            id: Math.random(),
            itemId: i.itemId,
            expectedQty: i.expectedQty
        }));
        setItems(mappedItems);
        setIsModalOpen(true);
    };

    const closeEditModal = () => {
        setIsModalOpen(false);
        setEditingData(null);
        form.resetFields();
        setItems([]);
    };

    const handleAddItem = () => {
        setItems([...items, { id: Math.random(), itemId: null, expectedQty: 1 }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: number, field: string, value: any) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const submitEdit = () => {
        form.validateFields().then(async (values) => {
            if (items.length === 0) {
                message.warning('Harap tambahkan minimal 1 barang');
                return;
            }
            try {
                const payload = {
                    data: {
                        customerId: values.customerId,
                        expectedDate: values.expectedDate.toISOString(),
                    },
                    items: items.map(item => ({
                        itemId: item.itemId,
                        expectedQty: Number(item.expectedQty)
                    }))
                };
                await api.put(`/booking/${editingData.id}`, payload);
                message.success('ASN berhasil diperbarui');
                closeEditModal();
                fetchBookings();
            } catch (error) {
                message.error('Gagal memperbarui ASN');
            }
        }).catch(err => {
            console.log('Validasi gagal:', err);
        });
    };

    const expandedRowRender = (record: any) => {
        const itemColumns = [
            { title: 'SKU / Kode', dataIndex: ['item', 'code'], key: 'itemCode' },
            { title: 'Nama Barang', dataIndex: ['item', 'name'], key: 'itemName' },
            { title: 'Rencana Qty', dataIndex: 'expectedQty', key: 'expectedQty' },
        ];
        return <Table columns={itemColumns} dataSource={record.items} pagination={false} rowKey="id" size="small" />;
    };

    const handleReceive = async (record: any) => {
        try {
            const receiptNo = `RCV-${Date.now()}`;
            await api.post('/inbound-receive', {
                receiptNo,
                bookingId: record.id
            });
            message.success('ASN berhasil diterima dan diproses ke Inbound QC');
            fetchBookings();
        } catch (error) {
            message.error('Gagal memproses penerimaan ASN');
        }
    };

    const columns = [
        { title: 'ASN Number', dataIndex: 'bookingNo', key: 'bookingNo' },
        { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer' },
        { title: 'Rencana Kedatangan', dataIndex: 'expectedDate', key: 'expectedDate', render: (text: string) => dayjs(text).format('DD MMM YYYY') },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                let displayStatus = status;
                if (status === 'WAITING_FOR_ARRIVAL') { color = 'processing'; displayStatus = 'WAITING FOR ARRIVAL'; }
                else if (status === 'RECEIVED') color = 'success';
                else if (status === 'CANCELLED') color = 'error';
                return <Tag color={color}>{displayStatus}</Tag>;
            }
        },
        { title: 'Dibuat Pada', dataIndex: 'createdAt', key: 'createdAt', render: (text: string) => dayjs(text).format('DD MMM YYYY HH:mm') },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, record: any) => {
                const isPending = record.status === 'WAITING_FOR_ARRIVAL';
                return (
                    <Space>
                        {user?.role?.name !== 'CUSTOMER' && isPending && (
                            <Popconfirm title="Terima dan proses ASN ini?" onConfirm={() => handleReceive(record)}>
                                <Button type="primary" size="small" style={{ backgroundColor: '#52c41a' }} icon={<CheckCircleOutlined />}>Terima</Button>
                            </Popconfirm>
                        )}
                        {canDelete && isPending && (
                            <Popconfirm title="Batalkan ASN ini?" onConfirm={() => handleDelete(record.id)}>
                                <Button type="default" danger size="small" icon={<DeleteOutlined />}>Cancel</Button>
                            </Popconfirm>
                        )}
                    </Space>
                );
            }
        }
    ];

    const itemColumnsEdit = [
        {
            title: 'Pilih SKU / Item',
            dataIndex: 'itemId',
            key: 'itemId',
            render: (_: any, record: any) => (
                <Select style={{ width: '100%' }} value={record.itemId} onChange={(val) => updateItem(record.id, 'itemId', val)}>
                    {availableItems.map(item => (
                        <Select.Option key={item.id} value={item.id}>{item.code} - {item.name}</Select.Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Rencana Qty',
            dataIndex: 'expectedQty',
            key: 'expectedQty',
            width: 150,
            render: (_: any, record: any) => (
                <Input type="number" value={record.expectedQty} min={1} onChange={(e) => updateItem(record.id, 'expectedQty', e.target.value)} />
            )
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_: any, record: any) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveItem(record.id)} />
            )
        }
    ];

    return (
        <div className="flex flex-col">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Booking' }, { title: 'Daftar ASN' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={fetchBookings} />
            </ToolbarWrapper>

            <Table 
                columns={columns.filter(col => user?.role?.name === 'CUSTOMER' ? col.key !== 'action' : true)} 
                dataSource={bookings} 
                rowKey="id" 
                loading={loading}
                expandable={{ expandedRowRender }}
                className="shadow-sm rounded-xl overflow-hidden bg-white"
            />

            <Modal title="Edit ASN" open={isModalOpen} onOk={submitEdit} onCancel={closeEditModal} width={800} okText="Simpan Perubahan">
                <Form form={form} layout="vertical" className="mt-4">
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label="Customer" name="customerId" rules={[{ required: true }]}>
                                <Select placeholder="Pilih Customer" disabled={!!user?.customerId}>
                                    {customers.map(c => <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="ASN Number" name="bookingNo">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label="Rencana Kedatangan" name="expectedDate" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider>Daftar Barang (Item)</Divider>
                    <div className="mb-4">
                        <Button type="dashed" onClick={handleAddItem} icon={<PlusOutlined />}>Tambah Barang</Button>
                    </div>
                    <Table columns={itemColumnsEdit} dataSource={items} pagination={false} rowKey="id" size="small" />
                </Form>
            </Modal>
        </div>
    );
}
