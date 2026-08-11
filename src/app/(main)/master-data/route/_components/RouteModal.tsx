import React from 'react';
import { Modal, Form, Input, Select } from 'antd';

interface RouteModalProps {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    form: any;
    editingData: any;
}

export default function RouteModal({ open, onOk, onCancel, form, editingData }: RouteModalProps) {
    return (
        <Modal
            title={editingData ? 'Edit Route' : 'Add Route'}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Code is required' }]}>
                    <Input placeholder="e.g. ROUTE-A" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <Input placeholder="e.g. Jalur Parkir Utara" />
                </Form.Item>
                <Form.Item name="status" label="Status" initialValue="ACTIVE">
                    <Select>
                        <Select.Option value="ACTIVE">ACTIVE</Select.Option>
                        <Select.Option value="INACTIVE">INACTIVE</Select.Option>
                        <Select.Option value="MAINTENANCE">MAINTENANCE</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
