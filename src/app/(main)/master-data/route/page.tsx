"use client";

import React, { useState, useEffect } from 'react';
import { Form, message, Breadcrumb } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';
import RouteTable from './_components/RouteTable';
import RouteModal from './_components/RouteModal';

export default function RoutePage() {
    const { user } = useAuthStore();
    const canCreate = true;
    const canEdit = true;
    const canDelete = true;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);
    const [form] = Form.useForm();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchRoutes = async () => {
        setLoading(true);
        try {
            const res = await api.get('/route');
            setRoutes(res.data);
        } catch (error) {
            message.error('Gagal mengambil data route');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingData) {
                    await api.put(`/route/${editingData.id}`, values);
                    message.success('Data route berhasil diubah!');
                } else {
                    await api.post('/route', values);
                    message.success('Data route berhasil ditambahkan!');
                }
                setIsModalOpen(false);
                setEditingData(null);
                form.resetFields();
                fetchRoutes();
            } catch (error) {
                message.error('Gagal menyimpan data route');
            }
        });
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/route/${id}`);
            message.success('Data route berhasil dihapus!');
            fetchRoutes();
        } catch (error) {
            message.error('Gagal menghapus data route');
        }
    };

    const handleEdit = (record: any) => {
        setEditingData(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Master Data' }, { title: 'Route' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={fetchRoutes} />
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

            <RouteTable
                routes={routes}
                loading={loading}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <RouteModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                form={form}
                editingData={editingData}
            />
        </>
    );
}
