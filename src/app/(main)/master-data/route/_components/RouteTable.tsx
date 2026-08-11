import React from 'react';
import { Table, Button, Space, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface RouteTableProps {
    routes: any[];
    loading: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (record: any) => void;
    onDelete: (id: string) => void;
}

export default function RouteTable({ routes, loading, canEdit, canDelete, onEdit, onDelete }: RouteTableProps) {
    const columns = [
        { title: 'Code', dataIndex: 'code', key: 'code', sorter: (a: any, b: any) => a.code.localeCompare(b.code) },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (status: string) => {
                let color = 'red';
                if (status === 'ACTIVE') color = 'green';
                if (status === 'MAINTENANCE') color = 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    {canEdit && (
                        <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
                    )}
                    {canDelete && (
                        <Popconfirm title="Delete this route?" onConfirm={() => onDelete(record.id)}>
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Table 
            columns={columns} 
            dataSource={routes} 
            rowKey="id" 
            loading={loading}
            size="small"
        />
    );
}
