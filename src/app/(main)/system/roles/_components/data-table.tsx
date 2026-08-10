import React, { useRef } from 'react';
import { Table, Input, Space, Button, Tag } from 'antd';
import type { InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Role } from '@/types';

interface DataTableProps {
    data: Role[];
    loading: boolean;
    selectedRowKeys: React.Key[];
    setSelectedRowKeys: (keys: React.Key[]) => void;
}

export default function DataTable({ data, loading, selectedRowKeys, setSelectedRowKeys }: DataTableProps) {
    const searchInput = useRef<InputRef>(null);

    const getColumnSearchProps = (dataIndex: keyof Role): any => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${String(dataIndex)}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
                        Search
                    </Button>
                    <Button onClick={() => { if (clearFilters) clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value: any, record: any) =>
            record[dataIndex]
                ?.toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
    });

    const columns: ColumnsType<Role> = [
        {
            title: 'Role Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name')
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (val: string) => val ? val : <span className="text-gray-400 italic">No description</span>
        },
        {
            title: 'Role Type',
            dataIndex: 'type',
            key: 'type',
            render: (val: string) => <Tag color={val === 'SUPER_ADMIN' ? 'purple' : 'blue'}>{val || 'CUSTOM'}</Tag>
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
                type: 'radio',
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