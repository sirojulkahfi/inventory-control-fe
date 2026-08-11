'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, App, Tag } from 'antd';
import { PlusOutlined, BookOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import BookingTable from './_components/BookingTable';
import BookingModal from './_components/BookingModal';

const { Title, Text } = Typography;

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
            // ROLE BASED FILTERING: If logged in user has customerId, ONLY show their bookings
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
            
            // Filter items based on customer if needed
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

    // Checking permissions. For a customer portal, if user.customerId is present, they can create.
    const canCreate = (user?.role?.permissions?.includes('CREATE_BOOKING') ?? false) || !!user?.customerId;
    const canDelete = (user?.role?.permissions?.includes('DELETE_BOOKING') ?? false) || !!user?.customerId;

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <Title level={2} style={{ margin: 0, color: '#063834' }}>
                        <BookOutlined className="mr-3" /> 
                        Manajemen ASN (Booking)
                    </Title>
                    <Text type="secondary" className="text-lg">
                        {user?.customerId ? "Buat dan pantau rencana pengiriman barang ke gudang." : "Kelola semua rencana pengiriman (ASN) dari Customer."}
                    </Text>
                </div>
                {canCreate && (
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleCreate}
                        size="large"
                        style={{ borderRadius: '8px' }}
                    >
                        Buat Rencana (ASN)
                    </Button>
                )}
            </div>

            <Card className="shadow-sm rounded-2xl" styles={{ body: { padding: 0 } }}>
                <BookingTable 
                    data={bookings}
                    loading={loading}
                    canDelete={canDelete}
                    onDelete={handleDelete}
                    isCustomerPortal={!!user?.customerId}
                />
            </Card>

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
        </div>
    );
}
