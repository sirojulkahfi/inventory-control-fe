"use client";

import React, { useState, useEffect } from 'react';
import { Breadcrumb, App } from 'antd';
import { ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckSquareOutlined, ProfileOutlined } from '@ant-design/icons';

import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';
import { inboundReceiveService } from '@/services/inbound/inbound-receive.service';
import { InboundReceive } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

import DataTable from './_components/data-table';
import ModalCreate from './_components/modal-create';
import ModalUpdate from './_components/modal-update';
import ModalDetail from './_components/modal-detail';

export default function IncomingReceivePage() {
    const { message, modal } = App.useApp();
    const { user } = useAuthStore();
    const [data, setData] = useState<InboundReceive[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedData, setSelectedData] = useState<InboundReceive | null>(null);
    const [mounted, setMounted] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await inboundReceiveService.findAll();
            setData(res);
        } catch (error) {
            message.error('Failed to fetch incoming manifest data');
        } finally {
            setLoading(false);
            setSelectedRowKeys([]);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    const getSelectedRecord = () => data.find((item) => item.id === selectedRowKeys[0]);

    const handleEdit = () => {
        if (selectedRowKeys.length === 1) {
            const record = getSelectedRecord();
            if (record) {
                setSelectedData(record);
                setIsEditModalVisible(true);
            }
        }
    };

    const handleDetail = () => {
        if (selectedRowKeys.length === 1) {
            const record = getSelectedRecord();
            if (record) {
                setSelectedData(record);
                setIsDetailModalVisible(true);
            }
        }
    };

    const handleReceive = () => {
        if (selectedRowKeys.length !== 1) return;
        const record = getSelectedRecord();
        if (record?.status === 'RECEIVED') {
            message.warning('This manifest is already received');
            return;
        }

        modal.confirm({
            title: 'Receive Manifest',
            content: `Are you sure you want to receive manifest ${record?.manifestNo}?`,
            okText: 'Yes, Receive',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await inboundReceiveService.receive(selectedRowKeys[0] as string, user?.name);
                    message.success('Manifest received successfully');
                    fetchData();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Failed to receive manifest');
                }
            },
        });
    };

    const handleDelete = () => {
        if (selectedRowKeys.length === 0) return;

        modal.confirm({
            title: 'Delete Manifest',
            content: `Are you sure you want to delete the selected manifest?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await inboundReceiveService.remove(selectedRowKeys[0] as string);
                    message.success('Manifest deleted successfully');
                    fetchData();
                } catch (error) {
                    message.error('Failed to delete manifest');
                }
            },
        });
    };

    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Inbound' }, { title: 'Incoming Receive' }]} />
            
            <ToolbarWrapper>
                <ButtonToolbar message="Refresh" icon={<ReloadOutlined />} onClick={fetchData} />
                <ButtonToolbar message="Create" icon={<PlusOutlined />} onClick={() => setIsCreateModalVisible(true)} />
                
                <ButtonToolbar 
                    message="Receive" 
                    icon={<CheckSquareOutlined />} 
                    onClick={handleReceive} 
                    enable={selectedRowKeys.length === 1} 
                />
                <ButtonToolbar 
                    message="Detail" 
                    icon={<ProfileOutlined />} 
                    onClick={handleDetail} 
                    enable={selectedRowKeys.length === 1} 
                />
                <ButtonToolbar 
                    message="Edit" 
                    icon={<EditOutlined />} 
                    onClick={handleEdit} 
                    enable={selectedRowKeys.length === 1} 
                />
                <ButtonToolbar 
                    message="Delete" 
                    icon={<DeleteOutlined />} 
                    onClick={handleDelete} 
                    enable={selectedRowKeys.length > 0} 
                />
            </ToolbarWrapper>

            {mounted && (
                <>
                    <DataTable 
                        data={data}
                        loading={loading}
                        selectedRowKeys={selectedRowKeys}
                        setSelectedRowKeys={setSelectedRowKeys}
                    />

                    {selectedData && (
                        <ModalUpdate
                            visible={isEditModalVisible}
                            onClose={() => setIsEditModalVisible(false)}
                            onSuccess={fetchData}
                            data={selectedData}
                        />
                    )}

                    {selectedData && (
                        <ModalDetail
                            visible={isDetailModalVisible}
                            onClose={() => setIsDetailModalVisible(false)}
                            data={selectedData}
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
