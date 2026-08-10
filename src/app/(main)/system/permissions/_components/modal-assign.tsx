import React, { useState, useEffect } from 'react';
import { Modal, Transfer, Spin, message } from 'antd'; // <-- message diimport langsung dari 'antd'
import { permissionsService } from '@/services/system/permissions.service';
import { rolesService } from '@/services/system/roles.service';
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
            const assignedIds = (role as any).permissions?.map((p: Permission) => p.id) || [];
            setTargetKeys(assignedIds);
        } else {
            setTargetKeys([]);
        }
    }, [visible, role]);

    const fetchMasterPermissions = async () => {
        setFetchingMaster(true);
        try {
            const res = await permissionsService.findAll();
            
            const formattedData = res.data.map((p: Permission) => ({
                id: p.id,
                name: `${p.action} ${p.subject}`,
                desc: p.description || `Akses modul ${p.action} ${p.subject}`
            })).sort((a: any, b: any) => a.name.localeCompare(b.name));
            
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
            await rolesService.updatePermissions(role.id as string, targetKeys as string[]);
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