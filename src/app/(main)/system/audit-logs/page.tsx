"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Table, Breadcrumb, App, Input, Space, Button, Tag } from 'antd';
import type { InputRef } from 'antd';
import { ReloadOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { auditLogsService } from '@/services/system/audit-logs.service';
import { AuditLog } from '@/types';
import ModalDetail from './_components/modal-detail';

export default function AuditLogsPage() {
    const { message } = App.useApp();
    const [data, setData] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [detailData, setDetailData] = useState<AuditLog | null>(null);
    const [mounted, setMounted] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await auditLogsService.findAll();
            setData(res.data);
        } catch (error) {
            message.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
            setSelectedRowKeys([]);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    const searchInput = useRef<InputRef>(null);

    const getColumnSearchProps = (dataIndex: keyof AuditLog): any => ({
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
            record[dataIndex]?.toString().toLowerCase().includes((value as string).toLowerCase()),
    });

    const columns = [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (val: string) => {
                let color = 'blue';
                if (val === 'CREATE') color = 'green';
                if (val === 'UPDATE') color = 'orange';
                if (val === 'DELETE') color = 'red';
                return <Tag color={color}>{val}</Tag>;
            },
            ...getColumnSearchProps('action')
        },
        {
            title: 'Entity Name',
            dataIndex: 'action',
            key: 'action',
            ...getColumnSearchProps('action')
        },
        {
            title: 'User',
            dataIndex: ['user', 'name'],
            key: 'user',
            render: (val: string) => val || 'System / Guest'
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
        },
        {
            title: 'Timestamp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : '-'
        }
    ];

    const handleDetail = () => {
        if (selectedRowKeys.length === 1) {
            const selectedRecord = data.find((item) => item.id === selectedRowKeys[0]);
            if (selectedRecord) {
                setDetailData(selectedRecord);
                setIsDetailModalVisible(true);
            }
        }
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'System' }, { title: 'Audit Logs' }]} />
            
            <ToolbarWrapper>
                <ButtonToolbar message="Refresh" icon={<ReloadOutlined />} onClick={fetchData} />
                <ButtonToolbar message="View Detail" icon={<EyeOutlined />} onClick={handleDetail} enable={selectedRowKeys.length === 1} />
            </ToolbarWrapper>

            {mounted && (
                <>
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
                            pageSize: 20, // Default 20 baris per halaman agar rapi
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showTotal: (total) => `Total ${total} items`,
                        }}
                        rowKey="id"
                        scroll={{ y: 'calc(100vh - 360px)' }}
                        className="small-table"
                        style={{ fontSize: '11px' }}
                    />

                    {detailData && (
                        <ModalDetail
                            visible={isDetailModalVisible}
                            onClose={() => setIsDetailModalVisible(false)}
                            data={detailData}
                        />
                    )}
                </>
            )}
        </>
    );
}