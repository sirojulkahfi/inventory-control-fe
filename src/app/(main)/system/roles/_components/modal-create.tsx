import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
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

    useEffect(() => {
        if (visible) {
            form.resetFields();
        }
    }, [visible, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await rolesService.create(values);
            message.success('Role created successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to create role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            title="Create New Role" 
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