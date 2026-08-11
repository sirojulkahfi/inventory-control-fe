"use client";

import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Modal, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import Barcode from 'react-barcode';
import api from '@/lib/api';

export default function PrintLpnTable() {
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inbound-receive');
            // Hanya tampilkan yang SUDAH di-QC
            const fetchedData = res.data.filter((r: any) => r.status === 'QC_PASSED' || r.status === 'QC_FAILED');
            setData(fetchedData);
        } catch (error) {
            message.error('Gagal mengambil data inbound receipt');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    const columns = [
        {
            title: 'No. Receipt',
            dataIndex: 'receiptNo',
            key: 'receiptNo',
            render: (text: string, record: any) => (
                <div>
                    <div className="font-bold">{text}</div>
                    <div className="text-xs text-gray-500">{record.booking?.bookingNo}</div>
                </div>
            )
        },
        {
            title: 'Tanggal QC',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (val: string) => new Date(val).toLocaleDateString(),
        },
        {
            title: 'QC Inspector',
            dataIndex: 'inspectorName',
            key: 'inspectorName',
            render: (val: string) => val ? <span className="font-semibold text-teal-700">{val}</span> : '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => {
                let color = 'default';
                if (text === 'QC_PASSED') color = 'green';
                if (text === 'QC_FAILED') color = 'red';
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Aksi (Print LPN)',
            render: (_: any, record: any) => {
                const firstLpn = record.putawayTasks && record.putawayTasks.length > 0 ? record.putawayTasks[0].lpn : 'No LPN Generated';
                return (
                    <Button 
                        type="primary" 
                        icon={<PrinterOutlined />} 
                        disabled={firstLpn === 'No LPN Generated'}
                        onClick={() => {
                            setSelectedRecord(record);
                            setIsPrintModalOpen(true);
                        }}
                    >
                        Cetak LPN
                    </Button>
                );
            },
        },
    ];

    const expandedRowRender = (record: any) => {
        const itemColumns = [
            { title: 'Item', dataIndex: ['item', 'name'], key: 'name' },
            { title: 'SKU', dataIndex: ['item', 'code'], key: 'sku' },
            { title: 'LPN (Barcode)', dataIndex: 'lpn', key: 'lpn' },
            { 
                title: 'Qty Diterima', 
                key: 'actualQty',
                render: (_: any, task: any) => (
                    <div className="font-bold">
                        {task.actualQty !== null ? task.actualQty : task.qty}
                        {task.actualQty < task.qty && (
                            <Tag color="red" className="ml-2 border-0">Shortage</Tag>
                        )}
                    </div>
                )
            },
        ];

        return (
            <div className="p-2">
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

    const renderPrintArea = () => {
        if (!selectedRecord) return null;
        
        // Loop over tasks to print them all if needed. For now just print first task to maintain previous behavior,
        // or print all tasks stacked! We'll print just the first task for simplicity as requested before, 
        // but typically a warehouse prints LPN for every item. We will stick to the UI design.
        const pt = selectedRecord.putawayTasks?.[0];
        const lpn = pt?.lpn || 'N/A';
        const itemName = pt?.item?.name || 'N/A';
        const itemCode = pt?.item?.code || 'N/A';
        const uom = pt?.item?.uom || 'PCS';
        const qty = pt?.actualQty !== null ? pt?.actualQty : pt?.qty || 0;
        
        return (
            <div id="barcode-print-area" className="flex flex-col border-2 border-dashed border-gray-300 bg-white" style={{ width: '100mm', height: '150mm', padding: '5mm', boxSizing: 'border-box' }}>
                {/* Header */}
                <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2 w-full">
                    <div>
                        <h1 className="text-2xl font-black m-0 leading-none">RJL LOG</h1>
                        <p className="text-xs font-semibold m-0">INVENTORY CONTROL SYSTEM</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold m-0">{new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Body - Details */}
                <div className="flex-1 w-full flex flex-col gap-2">
                    <div className="bg-gray-100 p-2 border border-black rounded">
                        <p className="text-xs text-gray-600 m-0">No. Receipt</p>
                        <p className="text-lg font-bold m-0">{selectedRecord.receiptNo}</p>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="bg-gray-100 p-2 border border-black rounded flex-1">
                            <p className="text-xs text-gray-600 m-0">No. ASN</p>
                            <p className="text-sm font-bold m-0">{selectedRecord.booking?.bookingNo}</p>
                        </div>
                        <div className="bg-gray-100 p-2 border border-black rounded flex-1">
                            <p className="text-xs text-gray-600 m-0">Actual Qty</p>
                            <p className="text-xl font-black m-0">{qty} <span className="text-sm font-normal uppercase">{uom}</span></p>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-2 border border-black rounded mt-1">
                        <p className="text-xs text-gray-600 m-0">Item Details</p>
                        <p className="text-lg font-black m-0">{itemName}</p>
                        <p className="text-sm font-semibold m-0">SKU: {itemCode}</p>
                    </div>
                </div>

                {/* Footer - Barcode */}
                <div className="w-full flex flex-col items-center justify-end mt-4 pt-4 border-t-2 border-black">
                    <p className="text-xs font-bold mb-1">LICENSE PLATE NUMBER (LPN)</p>
                    <div style={{ maxWidth: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                        <Barcode value={lpn} width={2} height={80} fontSize={16} margin={0} />
                    </div>
                </div>
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
                    expandedRowRender
                }}
            />
            
            {/* Modal Print LPN */}
            <Modal 
                title="Print Barcode LPN (100x150mm)" 
                open={isPrintModalOpen} 
                onOk={() => {
                    const printContent = document.getElementById('barcode-print-area');
                    const originalContents = document.body.innerHTML;
                    if (printContent) {
                        document.body.innerHTML = printContent.outerHTML; // outerHTML to keep the container itself
                        window.print();
                        document.body.innerHTML = originalContents;
                        window.location.reload(); 
                    }
                }} 
                onCancel={() => setIsPrintModalOpen(false)}
                okText="Print"
                width={500}
            >
                <style>
                    {`
                    @media print {
                        @page { size: 100mm 150mm; margin: 0; }
                        body * { visibility: hidden; }
                        #barcode-print-area, #barcode-print-area * { visibility: visible; }
                        #barcode-print-area { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            margin: 0;
                            border: none !important; 
                        }
                    }
                    `}
                </style>
                <div className="flex justify-center bg-gray-200 p-4 rounded-lg overflow-auto max-h-[70vh]">
                    {renderPrintArea()}
                </div>
            </Modal>
        </>
    );
}
