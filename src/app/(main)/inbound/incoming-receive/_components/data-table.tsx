import React, { useRef } from 'react';
import { Table, Input, Space, Button, Tag } from 'antd';
import type { InputRef } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { InboundReceive } from '@/types';

interface DataTableProps {
    data: InboundReceive[];
    loading: boolean;
    selectedRowKeys: React.Key[];
    setSelectedRowKeys: (keys: React.Key[]) => void;
}

export default function DataTable({ data, loading, selectedRowKeys, setSelectedRowKeys }: DataTableProps) {
    const searchInput = useRef<InputRef>(null);

    const getColumnSearchProps = (dataIndex: keyof InboundReceive): any => ({
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

    const columns: ColumnsType<InboundReceive> = [
        { title: 'Manifest No', dataIndex: 'manifestNo', key: 'manifestNo', ...getColumnSearchProps('manifestNo') },
        { title: 'Route', dataIndex: 'route', key: 'route', ...getColumnSearchProps('route') },
        { title: 'Supplier Name', dataIndex: 'supplierName', key: 'supplierName', ...getColumnSearchProps('supplierName') },
        { title: 'Dock Kode', dataIndex: 'dockCode', key: 'dockCode', ...getColumnSearchProps('dockCode') },
        { title: 'Order Qty', dataIndex: 'orderQty', key: 'orderQty' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (val: string) => {
                let color = 'blue';
                if (val === 'PENDING') color = 'orange';
                if (val === 'RECEIVED') color = 'green';
                return <Tag color={color}>{val}</Tag>;
            }
        },
        { title: 'Shift', dataIndex: 'shift', key: 'shift' },
        { 
            title: 'Arrival Time', 
            dataIndex: 'arrivalTime', 
            key: 'arrivalTime',
            render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'
        },
        { title: 'Name Received', dataIndex: 'nameReceived', key: 'nameReceived' },
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
                pageSize: 50,
                showSizeChanger: true,
                hideOnSinglePage: true,
            }}
            rowKey="id"
            scroll={{ y: 'calc(100vh - 360px)' }}
            className="small-table"
            style={{ fontSize: '11px' }}
        />
    );
}
