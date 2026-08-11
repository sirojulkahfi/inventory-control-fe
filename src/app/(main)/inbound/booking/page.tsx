'use client';

import React, { useState, useEffect } from 'react';
import { Breadcrumb, App } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import BookingTable from './_components/BookingTable';
import BookingModal from './_components/BookingModal';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';

export default function BookingPage() {
    const { user } = useAuthStore();
    const { message } = App.useApp();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // For Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // Master data for form
    const [items, setItems] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/booking');
            let data = res.data;
            if (user?.customerId) {
                data = data.filter((b: any) => b.customerId === user.customerId);
            }
            setBookings(data);
        } catch (error) {
            message.error('Gagal mengambil data booking (ASN)');
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [itemRes, custRes] = await Promise.all([
                api.get('/item'),
                api.get('/customer')
            ]);
            
            if (user?.customerId) {
                setItems(itemRes.data.filter((i: any) => i.customerId === user.customerId));
                setCustomers(custRes.data.filter((c: any) => c.id === user.customerId));
            } else {
                setItems(itemRes.data);
                setCustomers(custRes.data);
            }
        } catch (error) {
            message.error('Gagal memuat data master (Item/Customer)');
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchMasterData();
    }, [user]);

    const handleCreate = () => {
        setIsModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/booking/${id}`);
            message.success('Data booking berhasil dihapus');
            fetchBookings();
        } catch (error) {
            message.error('Gagal menghapus data booking');
        }
    };

    const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN';
    const canCreate = isSuperAdmin || (user?.role?.permissions?.includes('CREATE_BOOKING') ?? false) || (user?.role?.permissions?.includes('CREATE ASN') ?? false) || !!user?.customerId;
    const canDelete = isSuperAdmin || (user?.role?.permissions?.includes('DELETE_BOOKING') ?? false) || (user?.role?.permissions?.includes('DELETE ASN') ?? false) || !!user?.customerId;

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Inbound' }, { title: 'Manajemen ASN' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={fetchBookings} />
                {canCreate && (
                    <ButtonToolbar message="Buat Rencana (ASN)" icon={<PlusOutlined />} onClick={handleCreate} />
                )}
            </ToolbarWrapper>

            <BookingTable 
                data={bookings}
                loading={loading}
                canDelete={canDelete}
                onDelete={handleDelete}
                isCustomerPortal={!!user?.customerId}
            />

            <BookingModal 
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSuccess={() => {
                    setIsModalVisible(false);
                    fetchBookings();
                }}
                items={items}
                customers={customers}
                user={user}
            />
        </>
    );
}
