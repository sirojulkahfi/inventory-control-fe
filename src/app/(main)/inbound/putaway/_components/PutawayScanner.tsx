"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Steps, message } from 'antd';
import { ScanOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Title, Text } = Typography;

export default function PutawayScanner() {
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
            // Asumsi value yang discan adalah Location Code / ID.
            // Di sistem ideal kita fetch master location dulu, tapi di sini kita lempar value sbg actualLocId.
            await api.put(`/putaway/${activeTask.id}/confirm`, {
                actualLocId: value 
            });
            
            setLocation(value);
            setCurrentStep(2);
            message.success(`Putaway berhasil! Barang ${lpn} disimpan di ${value}`);
            fetchTasks(); // Refresh pending tasks
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
        <div className="max-w-2xl mx-auto">
            <Steps
                current={currentStep}
                items={[
                    { title: 'Scan Barcode LPN (Barang)' },
                    { title: 'Scan Barcode Lokasi (Rak)' },
                    { title: 'Selesai' },
                ]}
                className="mb-8"
            />

            <Card className="shadow-lg border-t-4 border-t-blue-500 rounded-xl">
                {currentStep === 0 && (
                    <div className="text-center py-10">
                        <ScanOutlined style={{ fontSize: 64, color: '#1677ff' }} className="mb-4" />
                        <Title level={4}>Arahkan Scanner ke Barcode LPN Palet</Title>
                        <Text type="secondary" className="block mb-6">Terdapat {pendingTasks.length} task putaway pending.</Text>
                        <Input 
                            ref={lpnInputRef}
                            size="large" 
                            placeholder="Scan LPN di sini..." 
                            className="max-w-xs text-center text-lg"
                            onPressEnter={(e) => handleScanLPN((e.target as HTMLInputElement).value)}
                        />
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="text-center py-10">
                        <ScanOutlined style={{ fontSize: 64, color: '#faad14' }} className="mb-4" />
                        <Title level={4}>Arahkan Scanner ke Barcode Rak (Lokasi)</Title>
                        <Text type="secondary" className="block mb-6">
                            Sistem merekomendasikan: <strong className="text-black">{activeTask?.suggestedLoc?.code || '-'}</strong>
                        </Text>
                        <Input 
                            ref={locInputRef}
                            size="large" 
                            disabled={loading}
                            placeholder="Scan Lokasi di sini..." 
                            className="max-w-xs text-center text-lg"
                            onPressEnter={(e) => handleScanLocation((e.target as HTMLInputElement).value)}
                        />
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="text-center py-10">
                        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} className="mb-4" />
                        <Title level={3} type="success">Putaway Selesai!</Title>
                        <p className="text-lg">Palet <strong>{lpn}</strong> berhasil disimpan di <strong>{location}</strong>.</p>
                        <Divider />
                        <Button type="primary" size="large" onClick={handleReset}>
                            Scan Palet Berikutnya
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
