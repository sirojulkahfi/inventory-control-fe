"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Table, Breadcrumb, App, Input, Space, Button, Tag } from 'antd';
import type { InputRef } from 'antd';
import { ReloadOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { usersService } from '@/services/system/users.service';
import { User } from '@/types';
import ModalCreate from './_components/modal-create';
import ModalUpdate from './_components/modal-update';

export default function UsersPage() {
    const { message, modal } = App.useApp();
    const [data, setData] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editData, setEditData] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await usersService.findAll();
            setData(res.data); // Karena createCrudService mengembalikan { data: [...] }
        } catch (error) {
            message.error('Failed to fetch users');
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

    const getColumnSearchProps = (dataIndex: keyof User): any => ({
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

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name')
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            ...getColumnSearchProps('username')
        },
        {
            title: 'Role',
            dataIndex: ['role', 'name'],
            key: 'role',
            render: (val: string) => <Tag color="blue">{val || 'No Role'}</Tag>
        },

        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
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
        if (selectedRowKeys.length === 0) return;

        modal.confirm({
            title: 'Delete User',
            content: `Are you sure you want to delete the selected user?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await usersService.remove(selectedRowKeys[0] as string);
                    message.success('User deleted successfully');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete user');
                }
            },
        });
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'System' }, { title: 'Users' }]} />
            
            <ToolbarWrapper>
                <ButtonToolbar message="Refresh" icon={<ReloadOutlined />} onClick={fetchData} />
                <ButtonToolbar message="Create" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} />
                <ButtonToolbar message="Edit" icon={<EditOutlined />} onClick={handleEdit} enable={selectedRowKeys.length === 1} />
                <ButtonToolbar message="Delete" icon={<DeleteOutlined />} onClick={handleDelete} enable={selectedRowKeys.length > 0} />
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

                    {editData && (
                        <ModalUpdate
                            visible={isEditModalVisible}
                            onClose={() => setIsEditModalVisible(false)}
                            onSuccess={fetchData}
                            data={editData}
                        />
                    )}

                    <ModalCreate
                        visible={isCreateModalVisible}
                        onClose={() => setIsCreateModalVisible(false)}
                        onSuccess={fetchData}
                    />
                </>
            )}
        </>
    );
}