import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { usersService } from '@/services/system/users.service';
import { rolesService } from '@/services/system/roles.service';
import { User } from '@/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: User;
}

export default function ModalUpdate({ visible, onClose, onSuccess, data }: Props) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (visible && data) {
            form.setFieldsValue({
                name: data.name,
                roleId: data.roleId,
            });
            fetchRoles();
        }
    }, [visible, data]);

    const fetchRoles = async () => {
        try {
            const res = await rolesService.findAll();
            setRoles(res.data.map((r: any) => ({ label: r.name, value: r.id })));
        } catch (error) {}
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await usersService.update(data.id, values);
            message.success('User updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            message.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Update User" open={visible} onOk={handleOk} onCancel={onClose} confirmLoading={loading}>
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter full name" />
                </Form.Item>
                <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
                    <Select placeholder="Select a role" options={roles} />
                </Form.Item>
                <Form.Item 
                    name="password" 
                    label="New Password" 
                    help="Leave blank if you do not want to change the password."
                >
                    <Input.Password placeholder="Enter new password" />
                </Form.Item>
            </Form>
        </Modal>
    );
}