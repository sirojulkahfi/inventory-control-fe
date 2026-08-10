"use client";

import React, { useState, useEffect } from 'react';
import { Breadcrumb, App } from 'antd';
import { ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { rolesService } from '@/services/system/roles.service';
import { Role } from '@/types';

import DataTable from './_components/data-table';
import ModalCreate from './_components/modal-create';
import ModalUpdate from './_components/modal-update';

export default function RolesPage() {
    const { message, modal } = App.useApp();
    const [data, setData] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editData, setEditData] = useState<Role | null>(null);
    const [mounted, setMounted] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await rolesService.findAll();
            setData(res.data);
        } catch (error) {
            message.error('Failed to fetch roles');
        } finally {
            setLoading(false);
            setSelectedRowKeys([]); // Reset selection saat data direfresh
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

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
            title: 'Delete Role',
            content: `Are you sure you want to delete the selected role?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await rolesService.remove(selectedRowKeys[0] as string);
                    message.success('Role deleted successfully');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete role. It might be used by users.');
                }
            },
        });
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'System' }, { title: 'Roles' }]} />
            
            <ToolbarWrapper>
                <ButtonToolbar message="Refresh" icon={<ReloadOutlined />} onClick={fetchData} />
                <ButtonToolbar message="Create" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} />
                <ButtonToolbar message="Edit" icon={<EditOutlined />} onClick={handleEdit} enable={selectedRowKeys.length === 1} />
                <ButtonToolbar message="Delete" icon={<DeleteOutlined />} onClick={handleDelete} enable={selectedRowKeys.length > 0} />
            </ToolbarWrapper>

            {mounted && (
                <>
                    <DataTable 
                        data={data}
                        loading={loading}
                        selectedRowKeys={selectedRowKeys}
                        setSelectedRowKeys={setSelectedRowKeys}
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