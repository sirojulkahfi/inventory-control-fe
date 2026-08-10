import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { User } from '@/types';

interface DataTableProps {
    data: User[];
    loading: boolean;
    selectedRowKeys: React.Key[];
    setSelectedRowKeys: (keys: React.Key[]) => void;
}

export default function DataTable({ data, loading, selectedRowKeys, setSelectedRowKeys }: DataTableProps) {
    const columns: ColumnsType<User> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: ['role', 'name'],
            key: 'role',
            render: (val: string) => <Tag color="blue">{val || 'No Role'}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (val: boolean) => val ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'
        }
    ];

    return (
        <Table
            rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                checkStrictly: true,
                type: 'radio', // Menggunakan radio button untuk edit/delete spesifik 1 baris
            }}
            columns={columns}
            dataSource={data}
            size="small"
            loading={loading}
            pagination={{
                size: 'small',
                pageSize: 100,
                showSizeChanger: true,
                hideOnSinglePage: true,
                showTotal: (total) => `Total ${total} items`,
            }}
            rowKey="id"
            scroll={{ y: 'calc(100vh - 360px)' }}
            className="small-table"
            style={{ fontSize: '11px' }}
        />
    );
}