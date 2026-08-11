import React from 'react';
import { Table, Typography, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

interface CustomerTableProps {
    customers: any[];
    loading: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (record: any) => void;
    onDelete: (id: string) => void;
}

export default function CustomerTable({ customers, loading, canEdit, canDelete, onEdit, onDelete }: CustomerTableProps) {
    const columns = [
        {
            title: 'Kode Customer',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Text strong className="text-blue-600">{text}</Text>,
        },
        {
            title: 'Nama Customer',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Contact Person',
            dataIndex: 'contactPerson',
            key: 'contactPerson',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Telepon',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Periode Kontrak',
            key: 'contract',
            render: (_: any, record: any) => {
                if (!record.contractStartDate && !record.contractEndDate) return '-';
                const start = record.contractStartDate ? dayjs(record.contractStartDate).format('DD MMM YYYY') : '?';
                const end = record.contractEndDate ? dayjs(record.contractEndDate).format('DD MMM YYYY') : '?';
                return `${start} - ${end}`;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="small">
                    {canEdit && (
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(record)}
                        />
                    )}
                    {canDelete && (
                        <Popconfirm
                            title="Are you sure delete this customer?"
                            onConfirm={() => onDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            placement="topRight"
                        >
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            )
        },
    ];

    return (
        <Table 
            dataSource={customers} 
            columns={columns} 
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            rowClassName="hover:bg-slate-50 transition-colors"
        />
    );
}
