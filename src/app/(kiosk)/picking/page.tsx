'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Steps, message, Row, Col } from 'antd';
import { ScanOutlined, CodeSandboxOutlined, CheckCircleOutlined, ShopOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function PickingPortal() {
    const [currentStep, setCurrentStep] = useState(0);
    const [scannedRack, setScannedRack] = useState('');
    const [scannedLpn, setScannedLpn] = useState('');
    const rackInputRef = useRef<any>(null);
    const lpnInputRef = useRef<any>(null);
    
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/picking');
            const pendingTasks = res.data.filter((t: any) => t.status === 'PENDING');
            setTasks(pendingTasks);
        } catch (error) {
            message.error('Gagal mengambil data picking task');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentStep === 0 && rackInputRef.current) rackInputRef.current.focus();
        if (currentStep === 1 && lpnInputRef.current) lpnInputRef.current.focus();
    }, [currentStep]);

    const activeTask = tasks.length > 0 ? tasks[0] : null;

    const handleScanRack = (value: string) => {
        if (!activeTask) return;
        if (value.trim().length > 0) {
            setScannedRack(value);
            setCurrentStep(1);
            message.success('Rak Sesuai! Silakan scan palet (LPN).');
        } else {
            message.error(`Rak salah! Silakan menuju rak yang benar`);
        }
    };

    const handleScanLPN = async (value: string) => {
        if (value && activeTask) {
            setLoading(true);
            try {
                await api.put(`/picking/${activeTask.id}/confirm`, {
                    pickedQty: activeTask.targetQty
                });
                setScannedLpn(value);
                setCurrentStep(2);
                message.success('Barang berhasil diambil (Picked)!');
            } catch (error) {
                message.error('Gagal mengkonfirmasi picking');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleReset = () => {
        setScannedRack('');
        setScannedLpn('');
        setCurrentStep(0);
        fetchTasks();
    };

    return (
        <div className="flex flex-col gap-6 p-4 h-full">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <Title level={2} style={{ margin: 0, color: '#063834' }}>
                        <ShopOutlined className="mr-3" /> 
                        Order Picking Portal
                    </Title>
                    <Text type="secondary" className="text-lg">Ambil barang dari rak sesuai instruksi order.</Text>
                </div>
            </div>

            <Row justify="center" className="flex-1">
                <Col xs={24} md={16} lg={12}>
                    {!activeTask ? (
                        <Card className="text-center py-20 shadow-lg border-t-8 border-t-gray-300 rounded-2xl h-[50vh] flex flex-col items-center justify-center">
                            <Title level={3} type="secondary" className="mb-6">Tidak ada order / picklist pending.</Title>
                            <Button onClick={fetchTasks} size="large" style={{ height: '60px', width: '200px', fontSize: '18px' }}>Refresh Data</Button>
                        </Card>
                    ) : (
                        <Card className="shadow-lg border-t-8 border-t-purple-500 rounded-2xl flex flex-col">
                            <div className="mb-8 p-6 bg-purple-50 rounded-xl flex justify-between items-center border border-purple-100">
                                <div>
                                    <div className="text-purple-600 font-bold mb-2 text-lg">Target Ambil (Item)</div>
                                    <Title level={3} style={{ margin: 0 }}>Item ID: {activeTask.itemId}</Title>
                                    <Text className="text-xl">Qty: <strong className="text-2xl">{activeTask.targetQty}</strong></Text>
                                </div>
                                <div className="text-right">
                                    <div className="text-purple-600 font-bold mb-2 text-lg">Lokasi Rak</div>
                                    <Text className="text-4xl font-mono bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-200 block">
                                        {activeTask.locationId || 'ANY'}
                                    </Text>
                                </div>
                            </div>

                            <Steps
                                current={currentStep}
                                items={[
                                    { title: 'Scan Rak' },
                                    { title: 'Scan Palet (LPN)' },
                                    { title: 'Selesai' },
                                ]}
                                className="mb-8"
                            />

                            <div className="min-h-[300px] flex items-center justify-center">
                                {currentStep === 0 && (
                                    <div className="text-center py-4 w-full flex flex-col items-center">
                                        <ScanOutlined style={{ fontSize: 80, color: '#1677ff' }} className="mb-6" />
                                        <Title level={3}>Arahkan Scanner ke Barcode RAK</Title>
                                        <Text type="secondary" className="block mb-8 text-xl">Pastikan kamu berada di rak <strong>{activeTask.locationId || 'ANY'}</strong></Text>
                                        <Input 
                                            ref={rackInputRef}
                                            size="large" 
                                            placeholder="Scan barcode lokasi..."
                                            className="max-w-md text-center text-2xl h-16 rounded-xl"
                                            onPressEnter={(e) => handleScanRack((e.target as HTMLInputElement).value)}
                                        />
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="text-center py-4 w-full flex flex-col items-center">
                                        <CodeSandboxOutlined style={{ fontSize: 80, color: '#faad14' }} className="mb-6" />
                                        <Title level={3}>Arahkan Scanner ke Barcode LPN Palet</Title>
                                        <Text type="secondary" className="block mb-8 text-xl">Ambil barang sejumlah <strong>{activeTask.targetQty}</strong></Text>
                                        <Input 
                                            ref={lpnInputRef}
                                            size="large" 
                                            disabled={loading}
                                            placeholder="Scan LPN Barang..." 
                                            className="max-w-md text-center text-2xl h-16 rounded-xl"
                                            onPressEnter={(e) => handleScanLPN((e.target as HTMLInputElement).value)}
                                        />
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="text-center py-4 w-full flex flex-col items-center">
                                        <CheckCircleOutlined style={{ fontSize: 100, color: '#52c41a' }} className="mb-6" />
                                        <Title level={2} type="success">Picking Selesai!</Title>
                                        <p className="text-2xl mt-4">Silakan bawa palet <strong>{scannedLpn}</strong> ke area <strong>Staging / Shipping</strong>.</p>
                                        <Divider className="my-8" />
                                        <Button type="primary" size="large" onClick={handleReset} style={{ height: '60px', fontSize: '20px', borderRadius: '12px', width: '300px' }}>
                                            Lanjut Order Berikutnya
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    );
}
