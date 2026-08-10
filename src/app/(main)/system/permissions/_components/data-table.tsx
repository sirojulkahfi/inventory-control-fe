import React from 'react';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Role, Permission } from '@/types';

interface DataTableProps {
    data: Role[];
    loading: boolean;
    selectedRowKeys: React.Key[];
    setSelectedRowKeys: (keys: React.Key[]) => void;
}

export default function DataTable({ data, loading, selectedRowKeys, setSelectedRowKeys }: DataTableProps) {
    
    const columns: ColumnsType<Role> = [
        {
            title: 'Role Name',
            dataIndex: 'name',
            key: 'name',
            width: 200,
            render: (val: string) => <strong className="text-gray-700">{val}</strong>
        },
        {
            title: 'Assigned Permissions',
            key: 'permissions',
            render: (_, record: Role) => (
                <div className="flex flex-wrap gap-1">
                    {(!record.permissions || record.permissions.length === 0) ? (
                        <span className="text-gray-400 italic text-xs">No permissions assigned</span>
                    ) : (
                        record.permissions.map((p: Permission) => (
                            <Tag key={p.id} color="blue" className="mb-1">{p.action}</Tag>
                        ))
                    )}
                </div>
            )
        }
    ];

    return (
        <Table
            rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys),
                type: 'radio', 
            }}
            columns={columns}
            dataSource={data}
            size="small"
            loading={loading}
            pagination={false}
            rowKey="id"
            scroll={{ y: 'calc(100vh - 300px)' }}
            className="small-table"
            style={{ fontSize: '11px' }}
        />
    );
}