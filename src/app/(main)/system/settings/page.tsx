"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Table, Breadcrumb, App, Input, Space, Button, Tag } from 'antd';
import type { InputRef } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { settingsService } from '@/services/system/settings.service';
import { Setting } from '@/types';

import ModalCreate from './_components/modal-create';
import ModalUpdate from './_components/modal-update';

export default function SystemSettingsPage() {
    const { message, modal } = App.useApp();
    const [data, setData] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editData, setEditData] = useState<Setting | null>(null);
    const [mounted, setMounted] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await settingsService.findAll();
            setData(res.data);
        } catch (error) {
            message.error('Failed to fetch system settings');
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

    const getColumnSearchProps = (dataIndex: keyof Setting): any => ({
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
            title: 'Setting Key',
            dataIndex: 'key',
            key: 'key',
            render: (val: string) => <Tag color="blue">{val}</Tag>,
            ...getColumnSearchProps('key')
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            ...getColumnSearchProps('value')
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ...getColumnSearchProps('description')
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (val: string) => val ? dayjs(val).format('YYYY-MM-DD HH:mm') : '-'
        }
    ];

    const handleEdit = () => {
        if (selectedRowKeys.length === 1) {
            const selectedRecord = data.find((item) => item.id === selectedRowKeys[0]);
            if (selectedRecord) {
                setEditData(selectedRecord);
                setIsEditModalVisible(true);
            }
        }
    };

    const handleDelete = () => {
        if (selectedRowKeys.length === 1) {
            const settingKey = data.find(d => d.id === selectedRowKeys[0])?.key;
            modal.confirm({
                title: 'Are you sure you want to delete this setting?',
                icon: <ExclamationCircleOutlined />,
                content: `Setting Key: ${settingKey}`,
                okText: 'Yes, Delete',
                okType: 'danger',
                cancelText: 'Cancel',
                centered: true,
                onOk: async () => {
                    try {
                        await settingsService.remove(selectedRowKeys[0] as string);
                        message.success('Setting successfully deleted');
                        fetchData();
                    } catch (error: any) {
                        message.error(error.response?.data?.message || 'Failed to delete setting');
                    }
                },
            });
        }
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'System' }, { title: 'System Settings' }]} />
            
            <ToolbarWrapper>
                <ButtonToolbar message="Refresh" icon={<ReloadOutlined />} onClick={fetchData} />
                <ButtonToolbar message="Create" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} />
                <ButtonToolbar message="Edit" icon={<EditOutlined />} onClick={handleEdit} enable={selectedRowKeys.length === 1} />
                <ButtonToolbar message="Delete" icon={<DeleteOutlined />} onClick={handleDelete} enable={selectedRowKeys.length === 1} />
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

                    <ModalCreate
                        visible={isCreateModalVisible}
                        onClose={() => setIsCreateModalVisible(false)}
                        onSuccess={fetchData}
                    />

                    {editData && (
                        <ModalUpdate
                            visible={isEditModalVisible}
                            onClose={() => setIsEditModalVisible(false)}
                            onSuccess={fetchData}
                            data={editData}
                        />
                    )}
                </>
            )}
        </>
    );
}