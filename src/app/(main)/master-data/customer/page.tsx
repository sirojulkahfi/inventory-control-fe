"use client";

import React, { useState, useEffect } from 'react';
import { Button, Typography, Space, Modal, Form, Input, Card, message, Breadcrumb, Popconfirm, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import dayjs from 'dayjs';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';
import CustomerTable from './_components/CustomerTable';
import CustomerModal from './_components/CustomerModal';

export default function CustomerPage() {
    const { user } = useAuthStore();
    const canCreate = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('CREATE CUSTOMER') ?? false);
    const canEdit = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('EDIT CUSTOMER') ?? false);
    const canDelete = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('DELETE CUSTOMER') ?? false);

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

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/customer/${id}`);
            message.success('Data customer berhasil dihapus!');
            fetchCustomers();
        } catch (error) {
            message.error('Gagal menghapus data customer');
        }
    };

    const handleEdit = (record: any) => {
        const editData = {
            ...record,
            contractStartDate: record.contractStartDate ? dayjs(record.contractStartDate) : null,
            contractEndDate: record.contractEndDate ? dayjs(record.contractEndDate) : null,
        };
        setEditingData(editData);
        form.setFieldsValue(editData);
        setIsModalOpen(true);
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Master Data' }, { title: 'Customer' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={fetchCustomers} />
                <ButtonToolbar message="Download CSV" icon={<DownloadOutlined />} />
                <ButtonToolbar message="Print Report" icon={<PrinterOutlined />} />
                {canCreate && (
                    <ButtonToolbar 
                        message="Add New" 
                        icon={<PlusOutlined />} 
                        onClick={() => {
                            setEditingData(null);
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                    />
                )}
            </ToolbarWrapper>

            <CustomerTable 
                customers={customers} 
                loading={loading} 
                canEdit={canEdit} 
                canDelete={canDelete} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />

            <CustomerModal 
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                form={form}
                editingData={editingData}
            />
        </>
    );
}
