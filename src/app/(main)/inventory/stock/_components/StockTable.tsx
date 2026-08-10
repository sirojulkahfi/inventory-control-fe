"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Typography, Space, Input, Tag, Card, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Text } = Typography;

const StockTable = forwardRef((props, ref) => {
    const [searchText, setSearchText] = useState('');
    const [inventories, setInventories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inventory');
            setInventories(res.data);
        } catch (error) {
            message.error('Gagal mengambil data inventory');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        fetchInventory
    }));

    useEffect(() => {
        fetchInventory();
    }, []);

    const columns = [
        {
            title: 'SKU Barang',
            key: 'itemCode',
            render: (_: any, record: any) => <Text strong className="text-blue-600">{record.item?.code || '-'}</Text>,
        },
        {
            title: 'Nama Barang',
            key: 'itemName',
            render: (_: any, record: any) => record.item?.name || '-',
        },
        {
            title: 'Lokasi Rak',
            key: 'locationCode',
            render: (_: any, record: any) => <Tag color="purple">{record.location?.code || '-'}</Tag>,
        },
        {
            title: 'No. Palet (LPN)',
            dataIndex: 'lpn',
            key: 'lpn',
            render: (text: string) => text ? <Text code>{text}</Text> : '-',
        },
        {
            title: 'Stok',
            dataIndex: 'qty',
            key: 'qty',
            align: 'right' as const,
            render: (qty: number) => <Text strong>{qty} Unit</Text>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'AVAILABLE' ? 'green' : 'orange'}>
                    {status}
                </Tag>
            ),
        },
    ];

    const filteredData = inventories.filter(inv => {
        const search = searchText.toLowerCase();
        return (
            inv.item?.code?.toLowerCase().includes(search) ||
            inv.item?.name?.toLowerCase().includes(search) ||
            inv.location?.code?.toLowerCase().includes(search) ||
            inv.lpn?.toLowerCase().includes(search)
        );
    });

    return (
        <Card className="shadow-sm rounded-xl overflow-hidden mt-2" styles={{ body: { padding: 0 } }}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <Input 
                    placeholder="Cari berdasarkan SKU, Nama, LPN, atau Lokasi..." 
                    prefix={<SearchOutlined className="text-gray-400" />} 
                    className="max-w-md"
                    size="large"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <Space>
                    <Button type="primary">Export CSV</Button>
                </Space>
            </div>
            
            <Table 
                dataSource={filteredData} 
                columns={columns} 
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                rowClassName="hover:bg-slate-50 transition-colors"
            />
        </Card>
    );
});

StockTable.displayName = 'StockTable';
export default StockTable;

