import React from 'react';
import { Modal, Descriptions, Tag } from 'antd';
import { AuditLog } from '@/types';
import dayjs from 'dayjs';

interface Props {
    visible: boolean;
    onClose: () => void;
    data: AuditLog;
}

export default function ModalDetail({ visible, onClose, data }: Props) {
    return (
        <Modal
            title="Audit Log Detail"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnHidden
        >
            <Descriptions bordered size="small" column={2} className="mt-4">
                <Descriptions.Item label="Action" span={1}>
                    <Tag color="blue">{data.action}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Entity Name" span={1}>
                    <strong>{data.entity}</strong>
                </Descriptions.Item>
                
                <Descriptions.Item label="Entity ID" span={2}>
                    {data.entityId || '-'}
                </Descriptions.Item>
                
                <Descriptions.Item label="User" span={1}>
                    {/* Assuming data.user is populated, otherwise fallback to userId */}
                    {data.userId ? (data as any).user?.name || data.userId : 'System'}
                </Descriptions.Item>
                <Descriptions.Item label="Timestamp" span={1}>
                    {data.createdAt ? dayjs(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                </Descriptions.Item>
                
                <Descriptions.Item label="IP Address" span={1}>
                    {data.ipAddress || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="User Agent" span={1}>
                    <span className="text-xs text-gray-500 break-all">{data.details?.userAgent || '-'}</span>
                </Descriptions.Item>
                
                <Descriptions.Item label="Old Values" span={2}>
                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto max-h-40">
                        {data.details?.oldValues ? JSON.stringify(data.details.oldValues, null, 2) : 'No previous data'}
                    </pre>
                </Descriptions.Item>
                
                <Descriptions.Item label="New Values" span={2}>
                    <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto max-h-40">
                        {data.details?.newValues ? JSON.stringify(data.details.newValues, null, 2) : 'No new data'}
                    </pre>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
}