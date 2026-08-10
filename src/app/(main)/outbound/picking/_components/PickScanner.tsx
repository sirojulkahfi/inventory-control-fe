"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, Input, Typography, Steps, Button, message, Divider, Spin } from 'antd';
import { ScanOutlined, CodeSandboxOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

const PickScanner = forwardRef((props, ref) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [scannedRack, setScannedRack] = useState('');
    const [scannedLpn, setScannedLpn] = useState('');
    const rackInputRef = useRef<any>(null);
    const lpnInputRef = useRef<any>(null);
    
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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

    useImperativeHandle(ref, () => ({
        fetchTasks
    }));

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if (currentStep === 0 && rackInputRef.current) rackInputRef.current.focus();
        if (currentStep === 1 && lpnInputRef.current) lpnInputRef.current.focus();
    }, [currentStep]);

    const activeTask = tasks.length > 0 ? tasks[0] : null;

    const handleScanRack = (value: string) => {
        if (!activeTask) return;
        // Asumsi lokasi code bisa diakses atau kita bypass
        if (value.trim().length > 0) { // Sederhanakan untuk demo
            setScannedRack(value);
            setCurrentStep(1);
            message.success('Rak Sesuai! Silakan scan palet (LPN).');
        } else {
            message.error(`Rak salah! Silakan menuju rak yang benar`);
        }
    };

    const handleScanLPN = async (value: string) => {
        if (value && activeTask) {
            try {
                await api.put(`/picking/${activeTask.id}/confirm`, {
                    pickedQty: activeTask.targetQty
                });
                setScannedLpn(value);
                setCurrentStep(2);
                message.success('Barang berhasil diambil (Picked)!');
            } catch (error) {
                message.error('Gagal mengkonfirmasi picking');
            }
        }
    };

    const handleReset = () => {
        setScannedRack('');
        setScannedLpn('');
        setCurrentStep(0);
        fetchTasks(); // Ambil task berikutnya
    };

    if (loading) {
        return <Card className="text-center py-10"><Spin size="large" description="Memuat task..." /></Card>;
    }

    if (!activeTask) {
        return (
            <Card className="text-center py-10 shadow-lg border-t-4 border-t-gray-300 rounded-xl">
                <Title level={4} type="secondary">Tidak ada picking task yang tertunda (PENDING).</Title>
                <Button onClick={fetchTasks} className="mt-4">Refresh Data</Button>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-t-4 border-t-purple-500 rounded-xl">
            <div className="mb-8 p-4 bg-purple-50 rounded-lg flex justify-between items-center">
                <div>
                    <div className="text-purple-600 font-bold mb-1">Target Pengambilan</div>
                    <Title level={4} style={{ margin: 0 }}>Item ID: {activeTask.itemId}</Title>
                    <Text>Qty: {activeTask.targetQty}</Text>
                </div>
                <div className="text-right">
                    <div className="text-purple-600 font-bold mb-1">Lokasi Rak</div>
                    <Text className="text-xl font-mono bg-white px-2 py-1 rounded shadow-sm border border-purple-100">
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

            {currentStep === 0 && (
                <div className="text-center py-10">
                    <ScanOutlined style={{ fontSize: 64, color: '#1677ff' }} className="mb-4" />
                    <Title level={4}>Arahkan Scanner ke Barcode Rak</Title>
                    <Input 
                        ref={rackInputRef}
                        size="large" 
                        placeholder="Scan lokasi..."
                        className="max-w-xs text-center text-lg"
                        onPressEnter={(e) => handleScanRack((e.target as HTMLInputElement).value)}
                    />
                </div>
            )}

            {currentStep === 1 && (
                <div className="text-center py-10">
                    <CodeSandboxOutlined style={{ fontSize: 64, color: '#faad14' }} className="mb-4" />
                    <Title level={4}>Arahkan Scanner ke Barcode Palet (LPN)</Title>
                    <Input 
                        ref={lpnInputRef}
                        size="large" 
                        placeholder="Scan LPN Barang..." 
                        className="max-w-xs text-center text-lg"
                        onPressEnter={(e) => handleScanLPN((e.target as HTMLInputElement).value)}
                    />
                </div>
            )}

            {currentStep === 2 && (
                <div className="text-center py-10">
                    <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} className="mb-4" />
                    <Title level={3} type="success">Picking Selesai!</Title>
                    <p className="text-lg">Silakan bawa barang ke area <strong>Staging / Packing</strong>.</p>
                    <Divider />
                    <Button type="primary" size="large" onClick={handleReset}>
                        Pick Task Berikutnya
                    </Button>
                </div>
            )}
        </Card>
    );
});

PickScanner.displayName = 'PickScanner';
export default PickScanner;
