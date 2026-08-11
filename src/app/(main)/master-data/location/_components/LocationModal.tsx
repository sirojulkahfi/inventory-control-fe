import React from 'react';
import { Modal, Form, Input, InputNumber, Row, Col, FormInstance } from 'antd';

interface LocationModalProps {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
    form: FormInstance<any>;
    editingData: any;
}

export default function LocationModal({ open, onOk, onCancel, form, editingData }: LocationModalProps) {
    return (
        <Modal title={editingData ? "Edit Lokasi Rak" : "Tambah Lokasi Rak"} open={open} onOk={onOk} onCancel={onCancel} width={600}>
            <Form form={form} layout="vertical" className="mt-4">
                <Row gutter={16}>
                    <Col span={6}>
                        <Form.Item label="Zona" name="zone" rules={[{ required: true }]}>
                            <Input placeholder="A" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Lorong" name="aisle" rules={[{ required: true }]}>
                            <Input placeholder="01" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Rak" name="rack" rules={[{ required: true }]}>
                            <Input placeholder="01" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label="Tingkat" name="level" rules={[{ required: true }]}>
                            <Input placeholder="01" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item label="Kapasitas Maksimal (Unit)" name="capacity" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
            </Form>
        </Modal>
    );
}
