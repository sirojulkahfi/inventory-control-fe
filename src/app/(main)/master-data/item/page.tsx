"use client";

import React, { useState, useEffect } from 'react';
import { Card, Form, message, Breadcrumb } from 'antd';
import { PlusOutlined, ReloadOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';
import ItemTable from './_components/ItemTable';
import ItemModal from './_components/ItemModal';

export default function ItemPage() {
    const { user } = useAuthStore();
    const canCreate = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('CREATE ITEM') ?? false);
    const canEdit = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('EDIT ITEM') ?? false);
    const canDelete = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('DELETE ITEM') ?? false);

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
                const payload = { ...values };
                delete payload.customer;
                delete payload.inventories;
                delete payload.putawayTasks;
                delete payload.pickTasks;
                delete payload.bookingItems;
                delete payload.outboundOrderItems;

                if (payload.conversion !== undefined) payload.conversion = payload.conversion ? Number(payload.conversion) : null;
                if (payload.length !== undefined) payload.length = payload.length ? Number(payload.length) : null;
                if (payload.width !== undefined) payload.width = payload.width ? Number(payload.width) : null;
                if (payload.height !== undefined) payload.height = payload.height ? Number(payload.height) : null;
                if (payload.weight !== undefined) payload.weight = payload.weight ? Number(payload.weight) : null;

                if (editingData) {
                    await api.put(`/item/${editingData.id}`, payload);
                    message.success('Data item berhasil diubah!');
                } else {
                    await api.post('/item', payload);
                    message.success('Data item berhasil ditambahkan!');
                }
                setIsModalOpen(false);
                setEditingData(null);
                form.resetFields();
                fetchItems();
            } catch (error: any) {
                console.error("Save error:", error?.response?.data || error);
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

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/item/${id}`);
            message.success('Data item berhasil dihapus!');
            fetchItems();
        } catch (error) {
            message.error('Gagal menghapus data item');
        }
    };

    const handleEdit = (record: any) => {
        setEditingData(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

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
                        onClick={() => {
                            setEditingData(null);
                            form.resetFields();
                            if (user?.customerId) {
                                form.setFieldsValue({ customerId: user.customerId });
                            }
                            setIsModalOpen(true);
                        }}
                    />
                )}
            </ToolbarWrapper>

            <Card className="shadow-sm rounded-xl overflow-hidden mt-2" styles={{ body: { padding: 0 } }}>
                <ItemTable 
                    items={items} 
                    loading={loading} 
                    canEdit={canEdit} 
                    canDelete={canDelete} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                />
            </Card>

            <ItemModal 
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                form={form}
                editingData={editingData}
                customers={customers}
                user={user}
            />
        </div>
    );
}

