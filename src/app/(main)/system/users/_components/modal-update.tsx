import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, App, Space, Button } from 'antd';
import { usersService } from '@/services/system/users.service';
import { rolesService } from '@/services/system/roles.service';
import api from '@/lib/api';
import { User } from '@/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: any;
}

export default function ModalUpdate({ visible, onClose, onSuccess, data }: Props) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
    const [customers, setCustomers] = useState<{ label: string; value: string }[]>([]);

    useEffect(() => {
        if (visible && data) {
            form.setFieldsValue({
                name: data.name,
                username: data.username,
                roleId: data.roleId,
                customerId: data.customerId,
            });
            fetchRoles();
            fetchCustomers();
        }
    }, [visible, data]);

    const fetchRoles = async () => {
        try {
            const res = await rolesService.findAll();
            setRoles(res.data.map((r: any) => ({ label: r.name, value: r.id })));
        } catch (error) {}
    };

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customer');
            setCustomers(res.data.map((c: any) => ({ label: c.name, value: c.id })));
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

    const generateUsername = () => {
        const name = form.getFieldValue('name');
        if (!name) {
            message.warning('Isi nama lengkap terlebih dahulu');
            return;
        }
        const base = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomNum = Math.floor(100 + Math.random() * 900);
        form.setFieldsValue({ username: `${base}${randomNum}` });
    };

    return (
        <Modal title="Update User" open={visible} onOk={handleOk} onCancel={onClose} confirmLoading={loading}>
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                    <Input placeholder="Enter full name" />
                </Form.Item>
                <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                    <Space.Compact style={{ width: '100%' }}>
                        <Input placeholder="Enter username" />
                        <Button type="primary" onClick={generateUsername}>Generate</Button>
                    </Space.Compact>
                </Form.Item>
                <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
                    <Select placeholder="Select a role" options={roles} />
                </Form.Item>
                <Form.Item name="customerId" label="Customer (B2B Client)" help="Kosongkan jika ini adalah akun internal (Admin/Gudang)">
                    <Select placeholder="Pilih Perusahaan" options={customers} allowClear />
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