'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Steps, message, Row, Col } from 'antd';
import { ScanOutlined, CheckCircleOutlined, CarOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function PutawayPortal() {
    const [currentStep, setCurrentStep] = useState(0);
    const [lpn, setLpn] = useState('');
    const [location, setLocation] = useState('');
    const [pendingTasks, setPendingTasks] = useState<any[]>([]);
    const [activeTask, setActiveTask] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const lpnInputRef = useRef<any>(null);
    const locInputRef = useRef<any>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/putaway');
            const pTasks = res.data.filter((t: any) => t.status === 'PENDING');
            setPendingTasks(pTasks);
        } catch (error) {
            message.error('Gagal mengambil data putaway task');
        }
    };

    useEffect(() => {
        if (currentStep === 0 && lpnInputRef.current) lpnInputRef.current.focus();
        if (currentStep === 1 && locInputRef.current) locInputRef.current.focus();
    }, [currentStep]);

    const handleScanLPN = (value: string) => {
        if (!value) return;
        const task = pendingTasks.find(t => t.lpn === value);
        if (!task) {
            message.error(`LPN ${value} tidak ditemukan di daftar task pending!`);
            return;
        }
        setLpn(value);
        setActiveTask(task);
        setCurrentStep(1);
        message.info(`LPN terscan: ${value}. Rekomendasi lokasi: ${task.suggestedLoc?.code || '-'}`);
    };

    const handleScanLocation = async (value: string) => {
        if (!value) return;
        if (!activeTask) return;
        
        setLoading(true);
        try {
            await api.put(`/putaway/${activeTask.id}/confirm`, {
                actualLocId: value 
            });
            
            setLocation(value);
            setCurrentStep(2);
            message.success(`Putaway berhasil! Barang ${lpn} disimpan di ${value}`);
            fetchTasks(); 
        } catch (error) {
            message.error('Gagal mengkonfirmasi putaway');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setLpn('');
        setLocation('');
        setActiveTask(null);
        setCurrentStep(0);
    };

    return (
        <div className="flex flex-col gap-6 p-4 h-full">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm">
                <div>
                    <Title level={2} style={{ margin: 0, color: '#063834' }}>
                        <CarOutlined className="mr-3" /> 
                        Putaway Task (Forklift)
                    </Title>
                    <Text type="secondary" className="text-lg">Scan LPN dan letakkan palet di rak tujuan.</Text>
                </div>
            </div>

            <Row justify="center" className="flex-1">
                <Col xs={24} md={16} lg={12}>
                    <Steps
                        current={currentStep}
                        items={[
                            { title: 'Scan Barcode LPN (Barang)' },
                            { title: 'Scan Barcode Lokasi (Rak)' },
                            { title: 'Selesai' },
                        ]}
                        className="mb-8"
                    />

                    <Card className="shadow-lg border-t-8 border-t-blue-500 rounded-2xl h-[50vh] flex items-center justify-center">
                        {currentStep === 0 && (
                            <div className="text-center py-10 w-full flex flex-col items-center">
                                <ScanOutlined style={{ fontSize: 80, color: '#1677ff' }} className="mb-6" />
                                <Title level={3}>Arahkan Scanner ke Barcode LPN Palet</Title>
                                <Text type="secondary" className="block mb-8 text-xl">Terdapat <strong>{pendingTasks.length}</strong> task putaway pending.</Text>
                                <Input 
                                    ref={lpnInputRef}
                                    size="large" 
                                    placeholder="Scan LPN di sini..." 
                                    className="max-w-md text-center text-2xl h-16 rounded-xl"
                                    onPressEnter={(e) => handleScanLPN((e.target as HTMLInputElement).value)}
                                />
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="text-center py-10 w-full flex flex-col items-center">
                                <ScanOutlined style={{ fontSize: 80, color: '#faad14' }} className="mb-6" />
                                <Title level={3}>Arahkan Scanner ke Barcode Rak (Lokasi)</Title>
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-8">
                                    <Text type="secondary" className="block text-lg">Sistem merekomendasikan diletakkan di:</Text>
                                    <Text strong className="text-3xl text-black block mt-2">{activeTask?.suggestedLoc?.code || 'PILIH RAK KOSONG'}</Text>
                                </div>
                                <Input 
                                    ref={locInputRef}
                                    size="large" 
                                    disabled={loading}
                                    placeholder="Scan Lokasi di sini..." 
                                    className="max-w-md text-center text-2xl h-16 rounded-xl"
                                    onPressEnter={(e) => handleScanLocation((e.target as HTMLInputElement).value)}
                                />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="text-center py-10 w-full flex flex-col items-center">
                                <CheckCircleOutlined style={{ fontSize: 100, color: '#52c41a' }} className="mb-6" />
                                <Title level={2} type="success">Putaway Selesai!</Title>
                                <p className="text-2xl mt-4">Palet <strong>{lpn}</strong> berhasil disimpan di <strong>{location}</strong>.</p>
                                <Divider className="my-8" />
                                <Button type="primary" size="large" onClick={handleReset} style={{ height: '60px', fontSize: '20px', borderRadius: '12px', width: '300px' }}>
                                    Scan Palet Berikutnya
                                </Button>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
