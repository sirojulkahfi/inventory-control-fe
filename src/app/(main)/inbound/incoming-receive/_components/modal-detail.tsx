import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { InboundReceive } from '@/types';
import dayjs from 'dayjs';

interface Props {
    visible: boolean;
    onClose: () => void;
    data: InboundReceive;
}

export default function ModalDetail({ visible, onClose, data }: Props) {
    return (
        <Modal
            title="Inbound Receive Detail"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            destroyOnHidden
        >
            <Descriptions bordered size="small" column={2} className="mt-4">
                <Descriptions.Item label="Manifest No" span={2}>
                    <strong>{data.manifestNo}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Route">
                    {data.route || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Dock Kode">
                    {data.dockCode || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Supplier Name" span={2}>
                    {data.supplierName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Order Qty">
                    {data.orderQty ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Shift">
                    {data.shift || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={2}>
                    <Tag color={data.status === 'RECEIVED' ? 'green' : 'orange'}>
                        {data.status}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Arrival Time" span={2}>
                    {data.arrivalTime ? dayjs(data.arrivalTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Name Received" span={2}>
                    {data.nameReceived || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                    {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                    {data.updatedAt ? dayjs(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}
