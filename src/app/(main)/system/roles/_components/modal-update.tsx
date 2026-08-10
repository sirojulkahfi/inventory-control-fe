import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { rolesService } from '@/services/system/roles.service';
import { Role } from '@/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: Role;
}

export default function ModalUpdate({ visible, onClose, onSuccess, data }: Props) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && data) {
            form.setFieldsValue({
                name: data.name,
                description: data.description,
            });
        }
    }, [visible, data, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await rolesService.update(data.id, values);
            message.success('Role updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            title="Update Role" 
            open={visible} 
            onOk={handleOk} 
            onCancel={onClose} 
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item 
                    name="name" 
                    label="Role Name" 
                    rules={[{ required: true, message: 'Please enter a role name' }]}
                >
                    <Input placeholder="e.g. Warehouse Staff, Finance SPV" />
                </Form.Item>
                <Form.Item 
                    name="description" 
                    label="Description" 
                >
                    <Input.TextArea placeholder="Enter role description" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
}