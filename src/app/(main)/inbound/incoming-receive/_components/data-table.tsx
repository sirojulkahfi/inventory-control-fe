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
            expandable={{
                expandedRowRender: (record: any) => {
                    if (!record.bookings || record.bookings.length === 0) {
                        return <div className="text-gray-500 italic p-4">Tidak ada data ASN (Manual DO).</div>;
                    }

                    return (
                        <div className="bg-gray-50 p-4 border rounded-md">
                            {record.bookings.map((booking: any) => (
                                <div key={booking.id} className="mb-4 last:mb-0">
                                    <div className="font-bold text-teal-700 mb-2 border-b pb-1">
                                        No ASN: {booking.bookingNo}
                                    </div>
                                    {!booking.items || booking.items.length === 0 ? (
                                        <div className="text-gray-500 italic pl-4">Tidak ada item di dalam ASN ini.</div>
                                    ) : (
                                        <Table
                                            dataSource={booking.items}
                                            columns={[
                                                { title: 'SKU', dataIndex: ['item', 'code'], key: 'sku' },
                                                { title: 'Nama Barang', dataIndex: ['item', 'name'], key: 'name' },
                                                { title: 'Qty (Base)', dataIndex: 'expectedQty', key: 'expectedQty' },
                                                { title: 'UOM', dataIndex: ['item', 'uom'], key: 'uom' },
                                                { 
                                                    title: 'Kemasan (Parent)', 
                                                    key: 'parentUom', 
                                                    render: (_, itemRecord: any) => {
                                                        const item = itemRecord.item;
                                                        if (item && item.parentUom && item.conversion) {
                                                            const parentQty = Math.floor(itemRecord.expectedQty / item.conversion);
                                                            const remainder = itemRecord.expectedQty % item.conversion;
                                                            let text = `${parentQty} ${item.parentUom}`;
                                                            if (remainder > 0) {
                                                                text += ` + ${remainder} ${item.uom}`;
                                                            }
                                                            return (
                                                                <span>
                                                                    <span className="font-medium text-teal-700">{text}</span>
                                                                    <span className="text-xs text-gray-400 block mt-0.5">1 {item.parentUom} = {item.conversion} {item.uom}</span>
                                                                </span>
                                                            );
                                                        }
                                                        return <span className="text-gray-400 italic">-</span>;
                                                    }
                                                },
                                            ]}
                                            pagination={false}
                                            size="small"
                                            rowKey="id"
                                            className="inner-item-table"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                },
            }}
        />
    );
}
