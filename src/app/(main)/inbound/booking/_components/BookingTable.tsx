import React, { useState } from 'react';
import { Table, Button, Popconfirm, Tag, Tooltip, Typography, Modal } from 'antd';
import { DeleteOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Barcode from 'react-barcode';

const { Text } = Typography;

interface BookingTableProps {
    data: any[];
    loading: boolean;
    canDelete: boolean;
    onDelete: (id: string) => void;
    isCustomerPortal: boolean;
}

export default function BookingTable({ data, loading, canDelete, onDelete, isCustomerPortal }: BookingTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    const columns = [
        {
            title: 'No. ASN',
            dataIndex: 'bookingNo',
            key: 'bookingNo',
            render: (text: string) => <Text strong className="text-blue-600">{text}</Text>
        },
        ...(!isCustomerPortal ? [{
            title: 'Customer',
            dataIndex: ['customer', 'name'],
            key: 'customer',
        }] : []),
        {
            title: 'Rencana Tiba',
            dataIndex: 'expectedDate',
            key: 'expectedDate',
            render: (date: string) => dayjs(date).format('DD MMM YYYY')
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'WAITING_FOR_ARRIVAL') color = 'blue';
                if (status === 'ARRIVED') color = 'cyan';
                if (status === 'PROCESSING') color = 'orange';
                if (status === 'COMPLETED') color = 'green';
                return <Tag color={color}>{status.replace(/_/g, ' ')}</Tag>;
            }
        },
        {
            title: 'Jml Item',
            key: 'itemsCount',
            render: (_: any, record: any) => record.items?.length || 0
        },
        {
            title: 'Aksi',
            key: 'action',
            width: 100,
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Tooltip title="Print ASN">
                        <Button 
                            type="text" 
                            icon={<PrinterOutlined />} 
                            onClick={() => {
                                setSelectedRecord(record);
                                setIsModalOpen(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Hapus">
                        <Popconfirm
                            title="Yakin ingin menghapus ASN ini?"
                            onConfirm={() => onDelete(record.id)}
                            disabled={!canDelete || record.status !== 'WAITING_FOR_ARRIVAL'}
                        >
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                                disabled={!canDelete || record.status !== 'WAITING_FOR_ARRIVAL'} 
                            />
                        </Popconfirm>
                    </Tooltip>
                </div>
            )
        }
    ];

    const renderPrintArea = () => {
        if (!selectedRecord) return null;
        
        return (
            <div id="asn-print-area" className="flex flex-col bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box' }}>
                <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6 w-full">
                    <div>
                        <h1 className="text-3xl font-black m-0 leading-none">RJL LOG</h1>
                        <p className="text-sm font-semibold m-0">INVENTORY CONTROL SYSTEM</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold m-0">ADVANCE SHIPMENT NOTICE</h2>
                        <p className="text-md m-0">Date: {dayjs(selectedRecord.createdAt).format('DD MMM YYYY')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="text-sm text-gray-500 font-bold m-0">Dari (Customer):</p>
                        <p className="text-lg font-bold m-0">{selectedRecord.customer?.name || 'Customer'}</p>
                        <p className="m-0">Rencana Kedatangan: {dayjs(selectedRecord.expectedDate).format('DD MMM YYYY')}</p>
                        {selectedRecord.inboundReceive?.supplierName && (
                            <p className="m-0 text-sm text-gray-600">Ekspedisi: {selectedRecord.inboundReceive.supplierName}</p>
                        )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                        <div>
                            <p className="text-xs text-gray-500 font-bold m-0 mb-1">Nomor ASN / Booking:</p>
                            <Barcode value={selectedRecord.bookingNo} width={1.2} height={40} fontSize={12} margin={0} />
                        </div>
                        {selectedRecord.inboundReceive?.manifestNo && (
                            <div className="mt-2">
                                <p className="text-xs text-gray-500 font-bold m-0 mb-1">Nomor Resi / Manifest:</p>
                                <Barcode value={selectedRecord.inboundReceive.manifestNo} width={1.2} height={40} fontSize={12} margin={0} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4 border border-black rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 border-b border-black">
                                <th className="p-3">No</th>
                                <th className="p-3">SKU</th>
                                <th className="p-3">Nama Barang</th>
                                <th className="p-3 text-right">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedRecord.items?.map((item: any, index: number) => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 font-semibold">{item.item?.code}</td>
                                    <td className="p-3">{item.item?.name}</td>
                                    <td className="p-3 text-right font-bold">{item.expectedQty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto pt-8 flex justify-between">
                    <div className="text-center">
                        <p className="mb-16">Diserahkan Oleh (Driver),</p>
                        <p className="border-t border-black px-8">( ................................... )</p>
                    </div>
                    <div className="text-center">
                        <p className="mb-16">Diterima Oleh (Security),</p>
                        <p className="border-t border-black px-8">( ................................... )</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id" 
                loading={loading}
                size="small"
                pagination={{
                    size: 'small',
                    pageSize: 100,
                    showSizeChanger: true,
                    hideOnSinglePage: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                scroll={{ y: 'calc(100vh - 360px)' }}
                className="small-table"
                style={{ fontSize: '11px' }}
            />
            
            <Modal 
                title="Print Dokumen ASN (A4)" 
                open={isModalOpen} 
                onOk={() => {
                    const printContent = document.getElementById('asn-print-area');
                    const originalContents = document.body.innerHTML;
                    if (printContent) {
                        document.body.innerHTML = printContent.outerHTML;
                        window.print();
                        document.body.innerHTML = originalContents;
                        window.location.reload(); 
                    }
                }} 
                onCancel={() => setIsModalOpen(false)}
                okText="Print Dokumen"
                width={900}
                style={{ top: 20 }}
            >
                <style>
                    {`
                    @media print {
                        @page { size: A4; margin: 0; }
                        body * { visibility: hidden; }
                        #asn-print-area, #asn-print-area * { visibility: visible; }
                        #asn-print-area { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 100%;
                            border: none !important; 
                        }
                    }
                    `}
                </style>
                <div className="flex justify-center bg-gray-200 p-4 rounded-lg overflow-auto max-h-[70vh]">
                    <div className="shadow-lg transform scale-90 origin-top">
                        {renderPrintArea()}
                    </div>
                </div>
            </Modal>
        </>
    );
}
