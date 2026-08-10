import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { usersService } from '@/services/system/users.service';
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
    }, [visible]);

    const fetchRoles = async () => {
        try {
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
            await usersService.create(values);
            message.success('User created successfully');
            onSuccess();
            onClose();
        } catch (error) {
            message.error('Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Create New User" open={visible} onOk={handleOk} onCancel={onClose} confirmLoading={loading}>
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter full name" />
                </Form.Item>
                <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                    <Input placeholder="Enter username (e.g. jdoe123)" />
                </Form.Item>
                <Form.Item name="password" label="Password" rules={[{ required: true }]}>
                    <Input.Password placeholder="Enter password" />
                </Form.Item>
                <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
                    <Select placeholder="Select a role" options={roles} />
                </Form.Item>
            </Form>
        </Modal>
    );
}