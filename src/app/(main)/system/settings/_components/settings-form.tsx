import React, { useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

interface Props {
    initialValues: Record<string, string>;
    onSubmit: (values: Record<string, string>) => void;
    loading: boolean;
}

export default function SettingsForm({ initialValues, onSubmit, loading }: Props) {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(initialValues);
    }, [initialValues, form]);

    return (
        <Form 
            form={form} 
            layout="vertical" 
            className="max-w-3xl"
            onFinish={onSubmit}
        >
            <h3 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b">General Configurations</h3>
            
            <Form.Item name="APP_NAME" label="Application Name" rules={[{ required: true, message: 'Please enter app name' }]}>
                <Input placeholder="e.g. Painting Inventory System" />
            </Form.Item>

            <Form.Item name="COMPANY_NAME" label="Company Name">
                <Input placeholder="e.g. PT Vuteq Indonesia" />
            </Form.Item>

            <Form.Item name="SUPPORT_EMAIL" label="Support Email" rules={[{ type: 'email', message: 'Invalid email format' }]}>
                <Input placeholder="support@vuteq.co.id" />
            </Form.Item>

            <h3 className="text-base font-semibold text-gray-700 mt-6 mb-4 pb-2 border-b">Notification & Integration</h3>

            <Form.Item name="WA_GATEWAY_URL" label="WhatsApp Gateway URL">
                <Input placeholder="https://api.whatsapp.com/send..." />
            </Form.Item>

            <Form.Item name="DEFAULT_NOTIFICATION_EMAIL" label="Default Notification Email">
                <Input placeholder="notifications@vuteq.co.id" />
            </Form.Item>

            <h3 className="text-base font-semibold text-gray-700 mt-6 mb-4 pb-2 border-b">System Parameters</h3>

            <Form.Item name="SESSION_TIMEOUT_MINUTES" label="Session Timeout (Minutes)">
                <Input type="number" placeholder="120" />
            </Form.Item>

            <div className="flex justify-end mt-6">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                    Save All Changes
                </Button>
            </div>
        </Form>
    );
}