"use client";

import React from 'react';
import { Table, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface ItemTableProps {
    items: any[];
    loading: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (record: any) => void;
    onDelete: (id: string) => void;
}

export default function ItemTable({ items, loading, canEdit, canDelete, onEdit, onDelete }: ItemTableProps) {
    const columns = [
        {
            title: 'SKU',
            dataIndex: 'code',
            key: 'code',
            // Gunakan span standar dan class font-semibold biar ngikutin ukuran tabel & gak warna biru
            render: (text: string) => <span className="font-semibold">{text}</span>,
        },
        {
            title: 'Nama Barang',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Base UOM',
            dataIndex: 'uom',
            key: 'uom',
        },
        {
            title: 'Parent UOM (Konversi)',
            key: 'parentUom',
            render: (_: any, record: any) => {
                if (!record.parentUom) return '-';
                return `${record.parentUom} (Isi ${record.conversion || 0})`;
            }
        },
        {
            title: 'Dimensi (LxWxH)',
            key: 'dimension',
            render: (_: any, record: any) => {
                if (!record.length && !record.width && !record.height) return '-';
                return `${record.length || 0}x${record.width || 0}x${record.height || 0} cm`;
            }
        },
        {
            title: 'Berat',
            key: 'weight',
            render: (_: any, record: any) => record.weight ? `${record.weight} kg` : '-',
        },
        {
            title: 'Pemilik (Customer)',
            key: 'customer',
            render: (_: any, record: any) => record.customer?.name || '-',
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
                            title="Are you sure delete this item?"
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
            dataSource={items}
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