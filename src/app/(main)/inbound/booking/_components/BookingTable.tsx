import React from 'react';
import { Table, Button, Popconfirm, Tag, Tooltip, Typography } from 'antd';
import { DeleteOutlined, InfoCircleOutlined, CarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

interface BookingTableProps {
    data: any[];
    loading: boolean;
    canDelete: boolean;
    onDelete: (id: string) => void;
    isCustomerPortal: boolean;
}

export default function BookingTable({ data, loading, canDelete, onDelete, isCustomerPortal }: BookingTableProps) {
    const columns = [
        {
            title: 'No. ASN',
            dataIndex: 'bookingNo',
            key: 'bookingNo',
            render: (text: string) => <Text strong className="text-blue-600">{text}</Text>
        },
        ...(!isCustomerPortal ? [{
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
        }] : []),
        {
            title: 'Rencana Tiba',
            dataIndex: 'expectedDate',
            key: 'expectedDate',
            render: (date: string) => dayjs(date).format('DD MMM YYYY')
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'WAITING_FOR_ARRIVAL') color = 'blue';
                if (status === 'ARRIVED') color = 'cyan';
                if (status === 'PROCESSING') color = 'orange';
                if (status === 'COMPLETED') color = 'green';
                return <Tag color={color}>{status.replace(/_/g, ' ')}</Tag>;
            }
        },
        {
            title: 'Jml Item',
            key: 'itemsCount',
            render: (_: any, record: any) => record.items?.length || 0
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 150,
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Tooltip title="Hapus">
                        <Popconfirm
                            title="Yakin ingin menghapus ASN ini?"
                            onConfirm={() => onDelete(record.id)}
                            disabled={!canDelete || record.status !== 'WAITING_FOR_ARRIVAL'}
                        >
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                disabled={!canDelete || record.status !== 'WAITING_FOR_ARRIVAL'} 
                            />
                        </Popconfirm>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <Table 
            columns={columns} 
            dataSource={data} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
        />
    );
}
