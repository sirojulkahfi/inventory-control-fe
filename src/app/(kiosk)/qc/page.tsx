'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Table, Modal, Tag, message } from 'antd';
import { CheckCircleOutlined, PrinterOutlined, AppstoreOutlined, ReloadOutlined } from '@ant-design/icons';
import Barcode from 'react-barcode';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function QCPortal() {
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
            render: (text: string) => <Text strong className="text-lg">{text}</Text>
        },
        {
            title: 'No. ASN',
            key: 'bookingNo',
            render: (_: any, record: any) => record.booking?.bookingNo || '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text: string) => {
                const color = text === 'RECEIVED' ? 'orange' : text === 'QUALITY_CHECKED' ? 'green' : 'default';
                return <Tag color={color} style={{ fontSize: '14px', padding: '4px 12px' }}>{text}</Tag>;
            },
        },
        {
            title: 'Aksi (Operator QC)',
            key: 'action',
            width: 350,
            render: (_: any, record: any) => {
                const firstLpn = record.putawayTasks && record.putawayTasks.length > 0 ? record.putawayTasks[0].lpn : 'No LPN Generated';
                const isReceived = record.status === 'RECEIVED';
                
                return (
                    <Space size="middle" className="w-full">
                        {isReceived ? (
                            <Button 
                                type="primary" 
                                size="large"
                                icon={<CheckCircleOutlined />} 
                                style={{ backgroundColor: '#faad14', height: '45px', width: '150px' }}
                                onClick={() => handleUpdateStatus(record.id, 'QUALITY_CHECKED')}
                            >
                                QC PASS
                            </Button>
                        ) : (
                            <Button 
                                type="primary" 
                                size="large"
                                icon={<PrinterOutlined />} 
                                disabled={firstLpn === 'No LPN Generated'}
                                style={{ height: '45px', width: '150px' }}
                                onClick={() => {
                                    setSelectedRecord(record);
                                    setIsModalOpen(true);
                                }}
                            >
                                PRINT LPN
                            </Button>
                        )}
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
                <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2 w-full">
                    <div>
                        <h1 className="text-2xl font-black m-0 leading-none">RJL LOG</h1>
                        <p className="text-xs font-semibold m-0">INVENTORY CONTROL SYSTEM</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold m-0">{new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

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
        <div className="flex flex-col gap-6 p-4">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <Title level={2} style={{ margin: 0, color: '#063834' }}>
                        <AppstoreOutlined className="mr-3" /> 
                        Receiving & QC Portal
                    </Title>
                    <Text type="secondary" className="text-lg">Hitung barang, QC Pass, dan Print LPN Barcode.</Text>
                </div>
                <Button size="large" icon={<ReloadOutlined />} onClick={fetchReceipts}>Refresh Data</Button>
            </div>

            <Card className="shadow-sm rounded-2xl" styles={{ body: { padding: 0 } }}>
                <Table 
                    dataSource={data} 
                    columns={columns} 
                    pagination={{ pageSize: 10 }} 
                    rowKey="id" 
                    loading={loading} 
                    rowClassName="h-16"
                />
            </Card>

            <Modal 
                title="Print Barcode LPN (100x150mm)" 
                open={isModalOpen} 
                onOk={() => {
                    const printContent = document.getElementById('barcode-print-area');
                    const originalContents = document.body.innerHTML;
                    if (printContent) {
                        document.body.innerHTML = printContent.outerHTML;
                        window.print();
                        document.body.innerHTML = originalContents;
                        window.location.reload(); 
                    }
                }} 
                onCancel={() => setIsModalOpen(false)}
                okText="Print"
                width={500}
                centered
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
        </div>
    );
}
