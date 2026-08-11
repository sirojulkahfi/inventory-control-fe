import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, App } from 'antd';
import api from '@/lib/api';
import { inboundReceiveService } from '@/services/inbound/inbound-receive.service';
import { InboundReceive } from '@/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    data: InboundReceive;
}

export default function ModalUpdate({ visible, onClose, onSuccess, data }: Props) {
    const [form] = Form.useForm();
    const { message } = App.useApp();

    const [docks, setDocks] = React.useState([]);
    const [routes, setRoutes] = React.useState([]);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [dockRes, routeRes] = await Promise.all([
                    api.get('/dock'),
                    api.get('/route')
                ]);
                setDocks(dockRes.data.filter((d: any) => d.status === 'ACTIVE'));
                setRoutes(routeRes.data.filter((r: any) => r.status === 'ACTIVE'));
            } catch (error) {
                console.error('Failed to fetch dock/route master data');
            }
        };
        fetchMasterData();
    }, []);

    useEffect(() => {
        if (visible && data) {
            form.setFieldsValue({
                manifestNo: data.manifestNo,
                route: data.route,
                supplierName: data.supplierName,
                dockCode: data.dockCode,
                orderQty: data.orderQty,
                shift: data.shift,
            });
        }
    }, [visible, data, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await inboundReceiveService.update(data.id, values);
            message.success('Inbound Receive updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update');
        }
    };

    return (
        <Modal
            title="Edit Incoming Receive"
            open={visible}
            onOk={handleSubmit}
            onCancel={onClose}
            destroyOnHidden
        >
            <Form form={form} layout="vertical">
                <Form.Item 
                    name="manifestNo" 
                    label="Manifest No" 
                    rules={[{ required: true, message: 'Manifest No is required' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="route" label="Route">
                    <Select placeholder="Pilih Route" allowClear showSearch>
                        {routes.map((r: any) => (
                            <Select.Option key={r.code} value={r.code}>{r.code} - {r.description || ''}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="supplierName" label="Supplier Name">
                    <Input placeholder="Supplier name" />
                </Form.Item>
                <Form.Item name="dockCode" label="Dock Kode">
                    <Select placeholder="Pilih Dock" allowClear showSearch>
                        {docks.map((d: any) => (
                            <Select.Option key={d.code} value={d.code}>{d.code} - {d.description || ''}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="orderQty" label="Order Qty">
                    <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
                <Form.Item name="shift" label="Shift">
                    <Select allowClear>
                        <Select.Option value="DAY">DAY</Select.Option>
                        <Select.Option value="NIGHT">NIGHT</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
