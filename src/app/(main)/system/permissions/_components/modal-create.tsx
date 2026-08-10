import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { permissionsService } from '@/services/system/permissions.service';
import { rolesService } from '@/services/system/roles.service';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ModalCreate({ visible, onClose, onSuccess }: Props) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (visible) {
            form.resetFields();
            fetchRoles();
        }
    }, [visible, form]);

    const fetchRoles = async () => {
        try {
            // Ambil daftar role dari backend untuk dimasukkan ke opsi dropdown
            const res = await rolesService.findAll();
            setRoles(res.data.map((r: any) => ({ label: r.name, value: r.id })));
        } catch (error) {
            message.error('Failed to load roles');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await permissionsService.create(values);
            message.success('Permission assigned successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to assign permission');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            title="Assign New Permission" 
            open={visible} 
            onOk={handleOk} 
            onCancel={onClose} 
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item 
                    name="roleId" 
                    label="Select Role" 
                    rules={[{ required: true, message: 'Please select a role' }]}
                >
                    <Select 
                        placeholder="Choose a role to assign" 
                        options={roles} 
                        showSearch
                        optionFilterProp="label"
                    />
                </Form.Item>
                <Form.Item 
                    name="action" 
                    label="Action Code" 
                    rules={[{ required: true, message: 'Please enter action code' }]}
                    tooltip="Format: <module>:<action>. Contoh: product:read, user:create"
                >
                    <Input placeholder="e.g. product:read" />
                </Form.Item>
            </Form>
        </Modal>
    );
}