"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Tag, message, InputNumber, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

const ReceiveTable = forwardRef((props, ref) => {
    const { user } = useAuthStore();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [qcLoading, setQcLoading] = useState<Record<string, boolean>>({});
    
    // State to hold local actual quantities for tasks before saving
    // key: taskId, value: actualQty
    const [taskQtys, setTaskQtys] = useState<Record<string, number>>({});

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inbound-receive');
            // Hanya tampilkan yang belum di-QC (status RECEIVED)
            const fetchedData = res.data.filter((r: any) => r.status === 'RECEIVED');
            setData(fetchedData);

            // Initialize taskQtys with expected qty if actualQty is null
            const initialQtys: Record<string, number> = {};
            fetchedData.forEach((receipt: any) => {
                receipt.putawayTasks?.forEach((task: any) => {
                    initialQtys[task.id] = task.actualQty !== null ? task.actualQty : task.qty;
                });
            });
            setTaskQtys(prev => ({ ...prev, ...initialQtys }));
        } catch (error) {
            message.error('Gagal mengambil data inbound receipt');
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        fetchReceipts
    }));

    useEffect(() => {
        fetchReceipts();
    }, []);

    const handleActualQtyChange = (taskId: string, value: number | null) => {
        setTaskQtys(prev => ({ ...prev, [taskId]: value || 0 }));
    };

    const submitQcVerify = async (receiptId: string, tasks: any[]) => {
        const tasksPayload = tasks.map(t => ({
            putawayTaskId: t.id,
            actualQty: taskQtys[t.id]
        }));

        setQcLoading(prev => ({ ...prev, [receiptId]: true }));
        try {
            await api.post(`/inbound-receive/${receiptId}/qc-verify`, { 
                tasks: tasksPayload,
                inspectorName: user?.name || 'Unknown Inspector'
            });
            
            const hasShortage = tasksPayload.some(t => {
                const expected = tasks.find(x => x.id === t.putawayTaskId)?.qty || 0;
                return t.actualQty < expected;
            });
            
            if (hasShortage) {
                message.warning(`Verifikasi Selesai: Terdapat selisih (SHORTAGE). Status menjadi QC_FAILED.`);
            } else {
                message.success('Verifikasi Selesai: Semua barang sesuai (QC_PASSED)');
            }
            
            fetchReceipts();
        } catch (error) {
            message.error('Gagal melakukan verifikasi QC');
        } finally {
            setQcLoading(prev => ({ ...prev, [receiptId]: false }));
        }
    };

    const columns = [
        {
            title: 'No. Receipt & Manifest',
            dataIndex: 'receiptNo',
            key: 'receiptNo',
            render: (text: string, record: any) => (
                <div>
                    <div className="font-bold">{text}</div>
                    <div className="text-xs text-gray-500">ASN: {record.booking?.bookingNo}</div>
                    {record.booking?.inboundReceive?.manifestNo && (
                        <div className="text-xs text-blue-500">DO: {record.booking.inboundReceive.manifestNo}</div>
                    )}
                </div>
            )
        },
        {
            title: 'Tanggal Dibuat',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val: string) => new Date(val).toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => {
                let color = 'default';
                if (text === 'RECEIVED') color = 'blue';
                if (text === 'QC_PASSED') color = 'green';
                if (text === 'QC_FAILED') color = 'red';
                return <Tag color={color}>{text}</Tag>;
            },
        }
    ];

    const expandedRowRender = (record: any) => {
        const itemColumns = [
            { title: 'Item', dataIndex: ['item', 'name'], key: 'name' },
            { title: 'SKU', dataIndex: ['item', 'code'], key: 'sku' },
            { title: 'Expected Qty', dataIndex: 'qty', key: 'qty' },
            { 
                title: 'Actual Qty', 
                key: 'actualQty',
                render: (_: any, task: any) => (
                    <div className="flex flex-col">
                        <InputNumber 
                            min={0} 
                            value={taskQtys[task.id]} 
                            onChange={(val) => handleActualQtyChange(task.id, val)}
                            disabled={record.status !== 'RECEIVED'}
                            className={taskQtys[task.id] < task.qty ? 'border-red-500' : ''}
                        />
                        {taskQtys[task.id] < task.qty && (
                            <span className="text-xs text-red-500 font-bold mt-1">Shortage!</span>
                        )}
                    </div>
                )
            },
        ];

        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="mb-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-600">Detail Item & Pengecekan Fisik (QC)</span>
                    {record.status === 'RECEIVED' && (
                        <Button 
                            type="primary" 
                            icon={<SaveOutlined />}
                            loading={qcLoading[record.id]}
                            onClick={() => submitQcVerify(record.id, record.putawayTasks)}
                        >
                            Simpan Verifikasi QC
                        </Button>
                    )}
                </div>
                <Table 
                    columns={itemColumns} 
                    dataSource={record.putawayTasks} 
                    pagination={false} 
                    rowKey="id"
                    size="small"
                />
            </div>
        );
    };

    return (
        <>
            <Table 
                dataSource={data} 
                columns={columns} 
                pagination={{ pageSize: 10 }} 
                rowKey="id" 
                loading={loading} 
                expandable={{
                    expandedRowRender,
                    defaultExpandAllRows: true
                }}
            />
        </>
    );
});

ReceiveTable.displayName = 'ReceiveTable';
export default ReceiveTable;
