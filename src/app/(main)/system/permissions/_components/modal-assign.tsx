import React, { useState, useEffect } from 'react';
import { Modal, Transfer, Spin, message } from 'antd'; // <-- message diimport langsung dari 'antd'
import { permissionsService } from '@/services/system/permissions.service';
import { Role, Permission } from '@/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    role: Role | null;
}

const AssignPermissionsModal: React.FC<Props> = ({ visible, onClose, onSuccess, role }) => {
    // const { message } = App.useApp(); // <-- Baris ini dihapus karena bikin error di child component
    const [targetKeys, setTargetKeys] = useState<React.Key[]>([]);
    
    const [availableActions, setAvailableActions] = useState<{ id: string, name: string, desc: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingMaster, setFetchingMaster] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchMasterPermissions();
        }
    }, [visible]);

    useEffect(() => {
        if (visible && role) {
            const assignedActions = role.permissions?.map((p: Permission) => p.action) || [];
            setTargetKeys(assignedActions);
        } else {
            setTargetKeys([]);
        }
    }, [visible, role]);

    const fetchMasterPermissions = async () => {
        setFetchingMaster(true);
        try {
            const res = await permissionsService.findAll();
            const uniqueActions = Array.from(new Set(res.data.map((p: Permission) => p.action)));
            
            const formattedData = uniqueActions.map((action: any) => ({
                id: action,
                name: action,
                desc: `Akses modul ${action}`
            }));
            
            setAvailableActions(formattedData);
        } catch (error) {
            message.error('Failed to load master permissions from server.');
        } finally {
            setFetchingMaster(false);
        }
    };

    const handleChange = (newTargetKeys: React.Key[]) => {
        setTargetKeys(newTargetKeys);
    };

    const handleOk = async () => {
        if (!role) return;
        setLoading(true);
        try {
            const initialActions = role.permissions?.map((p: Permission) => p.action) || [];

            const actionsToAdd = targetKeys.filter((key: React.Key) => !initialActions.includes(String(key)));
            const actionsToRemove = initialActions.filter((act: string) => !targetKeys.includes(act));

            const addPromises = actionsToAdd.map((action: React.Key) => 
                permissionsService.create({ roleId: role.id, action: String(action) })
            );
            
            const removePromises = actionsToRemove.map((action: string) => {
                const permId = role.permissions?.find((p: Permission) => p.action === action)?.id;
                return permId ? permissionsService.remove(permId) : Promise.resolve();
            });

            await Promise.all([...addPromises, ...removePromises]);

            message.success('Role permissions updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update permissions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Assign Permissions to: ${role?.name || ''}`}
            open={visible}
            onOk={handleOk}
            centered={true}
            onCancel={onClose}
            confirmLoading={loading}
            width={1050}
            destroyOnHidden
            zIndex={1050}
        >
            <Spin spinning={fetchingMaster} description="Loading permissions master data...">
                <div className="flex justify-center py-2">
                    <Transfer
                        dataSource={availableActions.map((p) => ({
                            key: p.id,
                            title: p.name,
                            description: p.desc,
                        }))}
                        showSearch
                        styles={{
                            section: {
                                width: 460,
                                height: 520,
                            }
                        }}
                        titles={['Available Permissions', 'Assigned to Role']}
                        targetKeys={targetKeys}
                        onChange={handleChange}
                        render={(item) => <span className="font-medium">{item.title}</span>} 
                    />
                </div>
            </Spin>
        </Modal>
    );
};

export default AssignPermissionsModal;