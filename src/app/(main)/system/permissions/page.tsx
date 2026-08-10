"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Table, Breadcrumb, App, Input, Space, Button, Tag } from 'antd';
import type { InputRef } from 'antd';
import { ReloadOutlined, ApiOutlined, SearchOutlined } from '@ant-design/icons';

import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { rolesService } from '@/services/system/roles.service';
import { permissionsService } from '@/services/system/permissions.service';
import { Role, Permission } from '@/types';

import AssignPermissionsModal from './_components/modal-assign';

export default function PermissionsPage() {
    const { message } = App.useApp();
    const [data, setData] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [editData, setEditData] = useState<Role | null>(null);
    const [mounted, setMounted] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes] = await Promise.all([
                rolesService.findAll(),
                permissionsService.findAll() // we might need this for something else, but rolesRes already has permissions
            ]);

            setData(rolesRes.data);
        } catch (error) {
            message.error('Failed to fetch permissions data');
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
            record[dataIndex]?.toString().toLowerCase().includes((value as string).toLowerCase()),
    });

    const columns = [
        {
            title: 'Role Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name')
        },
        {
            title: 'Role Type',
            dataIndex: 'type',
            key: 'type',
            render: (val: string) => <Tag color={val === 'SUPER_ADMIN' ? 'purple' : 'blue'}>{val || 'CUSTOM'}</Tag>
        },
        {
            title: 'Assigned Permissions',
            key: 'permissions',
            render: (_: any, record: Role) => (
                <Space size={[0, 4]} wrap>
                    {record.permissions?.slice(0, 5).map((p: Permission) => (
                        <Tag color="cyan" key={p.id} style={{ fontSize: '10px' }}>
                            {p.action} {p.subject}
                        </Tag>
                    ))}
                    {record.permissions && record.permissions.length > 5 && (
                        <Tag color="default" style={{ fontSize: '10px' }}>
                            +{record.permissions.length - 5} more
                        </Tag>
                    )}
                    {(!record.permissions || record.permissions.length === 0) && (
                        <span className="text-gray-400 text-xs italic">No permissions assigned</span>
                    )}
                </Space>
            )
        }
    ];

    const handleAssignPermissions = () => {
        if (selectedRowKeys.length === 1) {
            const selectedRecord = data.find((item) => item.id === selectedRowKeys[0]);
            if (selectedRecord) {
                setEditData(selectedRecord);
                setIsAssignModalVisible(true);
            }
        }
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'System' }, { title: 'Permissions Matrix' }]} />
            
            <ToolbarWrapper>
                <ButtonToolbar message="Refresh" icon={<ReloadOutlined />} onClick={fetchData} />
                <ButtonToolbar message="Assign Permissions" icon={<ApiOutlined />} onClick={handleAssignPermissions} enable={selectedRowKeys.length === 1} />
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
                        <AssignPermissionsModal
                            visible={isAssignModalVisible}
                            onClose={() => setIsAssignModalVisible(false)}
                            onSuccess={fetchData}
                            role={editData}
                        />
                    )}
                </>
            )}
        </>
    );
}