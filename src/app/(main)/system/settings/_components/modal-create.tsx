import React, { useState } from 'react';
import { Modal, Form, Input, App } from 'antd';
import { settingsService } from '@/services/system/settings.service';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ModalCreate({ visible, onClose, onSuccess }: Props) {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            // Menggunakan method upsert sesuai service backend kamu
            await (settingsService as any).upsert(values);
            
            message.success('Setting created successfully');
            onSuccess();
            form.resetFields();
            onClose();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(error.response?.data?.message || 'Failed to create setting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create System Setting"
            open={visible}
            onOk={handleOk}
            centered
            onCancel={() => { form.resetFields(); onClose(); }}
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item name="key" label="Setting Key" rules={[{ required: true, message: 'Please enter setting key' }]}>
                    <Input placeholder="e.g. APP_NAME" />
                </Form.Item>
                <Form.Item name="value" label="Value" rules={[{ required: true, message: 'Please enter setting value' }]}>
                    <Input placeholder="e.g. Painting System" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input.TextArea placeholder="Enter description" rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
}