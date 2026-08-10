import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, App } from 'antd';
import { settingsService } from '@/services/system/settings.service';
import { Setting } from '@/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: Setting | null;
}

export default function ModalUpdate({ visible, onClose, onSuccess, data }: Props) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && data) {
            form.setFieldsValue(data);
        }
    }, [visible, data, form]);

    const handleOk = async () => {
        if (!data) return;
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Menggunakan method update
            await settingsService.update(data.id, {
                value: values.value,
                description: values.description
            });

            message.success('Setting updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error.response?.data?.message || 'Failed to update setting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Edit Setting: ${data?.key || ''}`}
            open={visible}
            onOk={handleOk}
            centered
            onCancel={() => { form.resetFields(); onClose(); }}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item name="key" label="Setting Key">
                    <Input disabled className="bg-gray-100 font-semibold" />
                </Form.Item>
                <Form.Item name="value" label="Value" rules={[{ required: true, message: 'Please enter setting value' }]}>
                    <Input placeholder="Enter value" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea placeholder="Enter description" rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
}