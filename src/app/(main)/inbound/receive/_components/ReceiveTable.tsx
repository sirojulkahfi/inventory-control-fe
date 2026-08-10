"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Tag, Space, Modal, message } from 'antd';
import { CheckCircleOutlined, PrinterOutlined } from '@ant-design/icons';
import Barcode from 'react-barcode';
import api from '@/lib/api';

const ReceiveTable = forwardRef((props, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/inbound-receive');
            setData(res.data);
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

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/inbound-receive/${id}/status`, { status });
            message.success(`Status berhasil diubah menjadi ${status}`);
            fetchReceipts();
        } catch (error) {
            message.error('Gagal mengubah status');
        }
    };

    const columns = [
        {
            title: 'No. Receipt',
            dataIndex: 'receiptNo',
            key: 'receiptNo',
        },
        {
            title: 'No. ASN',
            key: 'bookingNo',
            render: (_: any, record: any) => record.booking?.bookingNo || '-',
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
                const color = text === 'RECEIVED' ? 'green' : text === 'QUALITY_CHECKED' ? 'blue' : 'default';
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Aksi',
            render: (_: any, record: any) => {
                // Get the first putaway task LPN (or ideally show a list if multiple)
                const firstLpn = record.putawayTasks && record.putawayTasks.length > 0 ? record.putawayTasks[0].lpn : 'No LPN Generated';
                return (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<CheckCircleOutlined />} 
                        style={{ color: '#52c41a' }}
                        disabled={record.status !== 'RECEIVED'}
                        onClick={() => handleUpdateStatus(record.id, 'QUALITY_CHECKED')}
                    >
                        QC Pass
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<PrinterOutlined />} 
                        disabled={firstLpn === 'No LPN Generated'}
                        onClick={() => {
                            setSelectedRecord(record);
                            setIsModalOpen(true);
                        }}
                    >
                        Print LPN
                    </Button>
                </Space>
                );
            },
        },
    ];

    const renderPrintArea = () => {
        if (!selectedRecord) return null;
        const pt = selectedRecord.putawayTasks?.[0];
        const lpn = pt?.lpn || 'N/A';
        const itemName = pt?.item?.name || 'N/A';
        const itemCode = pt?.item?.code || 'N/A';
        const uom = pt?.item?.uom || 'PCS';
        const qty = pt?.qty || 0;
        
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
                            <p className="text-xs text-gray-600 m-0">Qty</p>
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
            <Table dataSource={data} columns={columns} pagination={{ pageSize: 10 }} rowKey="id" loading={loading} />
            
            <Modal 
                title="Print Barcode LPN (100x150mm)" 
                open={isModalOpen} 
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
                onCancel={() => setIsModalOpen(false)}
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
});

ReceiveTable.displayName = 'ReceiveTable';
export default ReceiveTable;
