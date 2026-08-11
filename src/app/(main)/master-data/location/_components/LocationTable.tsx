import React from 'react';
import { Table, Space, Button, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface LocationTableProps {
    locations: any[];
    loading: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (record: any) => void;
    onDelete: (id: string) => void;
}

export default function LocationTable({ locations, loading, canEdit, canDelete, onEdit, onDelete }: LocationTableProps) {
    const columns = [
        {
            title: 'Kode Lokasi',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Zona',
            dataIndex: 'zone',
            key: 'zone',
        },
        {
            title: 'Lorong',
            dataIndex: 'aisle',
            key: 'aisle',
        },
        {
            title: 'Rak',
            dataIndex: 'rack',
            key: 'rack',
        },
        {
            title: 'Tingkat',
            dataIndex: 'level',
            key: 'level',
        },
        {
            title: 'Kapasitas (Qty)',
            dataIndex: 'capacity',
            key: 'capacity',
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
                            title="Are you sure delete this location?"
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
        }
    ];

    return (
        <Table 
            dataSource={locations} 
            columns={columns} 
            rowKey="id"
            loading={loading}
            size="small"
            pagination={{
                size: 'small',
                pageSize: 100,
                showSizeChanger: true,
                hideOnSinglePage: true,
                showTotal: (total) => `Total ${total} items`,
            }}
            scroll={{ y: 'calc(100vh - 360px)' }}
            className="small-table"
            style={{ fontSize: '11px' }}
        />
    );
}
