"use client";

import React, { useState, useEffect } from 'react';
import { Form, message, Breadcrumb } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';
import DockTable from './_components/DockTable';
import DockModal from './_components/DockModal';

export default function DockPage() {
    const { user } = useAuthStore();
    const canCreate = true;
    const canEdit = true;
    const canDelete = true;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState<any>(null);
    const [form] = Form.useForm();
    const [docks, setDocks] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDocks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/dock');
            setDocks(res.data);
        } catch (error) {
            message.error('Gagal mengambil data dock');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocks();
    }, []);

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingData) {
                    await api.put(`/dock/${editingData.id}`, values);
                    message.success('Data dock berhasil diubah!');
                } else {
                    await api.post('/dock', values);
                    message.success('Data dock berhasil ditambahkan!');
                }
                setIsModalOpen(false);
                setEditingData(null);
                form.resetFields();
                fetchDocks();
            } catch (error) {
                message.error('Gagal menyimpan data dock');
            }
        });
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/dock/${id}`);
            message.success('Data dock berhasil dihapus!');
            fetchDocks();
        } catch (error) {
            message.error('Gagal menghapus data dock');
        }
    };

    const handleEdit = (record: any) => {
        setEditingData(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Master Data' }, { title: 'Dock' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={fetchDocks} />
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

            <DockTable
                docks={docks}
                loading={loading}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <DockModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                form={form}
                editingData={editingData}
            />
        </>
    );
}
