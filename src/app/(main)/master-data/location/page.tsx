"use client";

import React, { useState, useEffect } from 'react';
import { Button, Typography, Space, Modal, Form, Input, Card, InputNumber, Row, Col, Tag, message, Breadcrumb, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { useAuthStore } from '@/store/useAuthStore';
import LocationTable from './_components/LocationTable';
import LocationModal from './_components/LocationModal';

const { Title, Text } = Typography;

export default function LocationPage() {
    const { user } = useAuthStore();
    const canCreate = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('CREATE LOCATION') ?? false);
    const canEdit = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('EDIT LOCATION') ?? false);
    const canDelete = user?.role?.name === 'SUPER_ADMIN' || (user?.role?.permissions?.includes('DELETE LOCATION') ?? false);

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

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/location/${id}`);
            message.success('Data lokasi berhasil dihapus!');
            fetchLocations();
        } catch (error) {
            message.error('Gagal menghapus data lokasi');
        }
    };

    const handleEdit = (record: any) => {
        setEditingData(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

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
                        onClick={() => {
                            setEditingData(null);
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                    />
                )}
            </ToolbarWrapper>

            <Card className="shadow-sm rounded-xl overflow-hidden mt-2" styles={{ body: { padding: 0 } }}>
                <LocationTable 
                    locations={locations} 
                    loading={loading} 
                    canEdit={canEdit} 
                    canDelete={canDelete} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                />
            </Card>

            <LocationModal 
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                form={form}
                editingData={editingData}
            />
        </div>
    );
}

