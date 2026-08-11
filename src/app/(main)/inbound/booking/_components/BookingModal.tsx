import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Button, Space, Typography, InputNumber, App, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined, CarOutlined } from '@ant-design/icons';
import api from '@/lib/api';

const { Text } = Typography;

interface BookingModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    items: any[];
    customers: any[];
    user: any;
}

export default function BookingModal({ open, onCancel, onSuccess, items, customers, user }: BookingModalProps) {
    const [form] = Form.useForm();
    const { message } = App.useApp();

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (user?.customerId) {
                form.setFieldsValue({ customerId: user.customerId });
            }
        }
    }, [open, user]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            // Transform data for backend
            const payload = {
                data: {
                    customerId: values.customerId,
                    expectedDate: values.expectedDate.toISOString(),
                },
                items: values.items.map((item: any) => ({
                    itemId: item.itemId,
                    expectedQty: item.expectedQty
                })),
                manifestNo: values.manifestNo,
                supplierName: values.supplierName
            };

            await api.post('/booking', payload);
            message.success('ASN berhasil dibuat');
            onSuccess();
        } catch (error: any) {
            if (error.errorFields) {
                message.error('Mohon lengkapi semua field yang wajib');
            } else {
                message.error('Gagal membuat ASN');
            }
        }
    };

    return (
        <Modal
            title="Buat Rencana Pengiriman (ASN)"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            width={800}
            destroyOnClose
            okText="Buat ASN"
            cancelText="Batal"
        >
            <Form form={form} layout="vertical" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item 
                        label="Customer / Pemilik Barang" 
                        name="customerId" 
                        rules={[{ required: true, message: 'Wajib dipilih' }]}
                    >
                        <Select placeholder="Pilih Customer" disabled={!!user?.customerId}>
                            {customers.map(c => (
                                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item 
                        label="Rencana Tanggal Kedatangan" 
                        name="expectedDate" 
                        rules={[{ required: true, message: 'Wajib diisi' }]}
                    >
                        <DatePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 mt-2">
                    <div className="flex items-center gap-2 mb-4">
                        <CarOutlined className="text-blue-600 text-lg" />
                        <Text strong className="text-blue-800 text-lg">Informasi Ekspedisi (Opsional Tapi Direkomendasikan)</Text>
                    </div>
                    <Text type="secondary" className="block mb-4">
                        Isi bagian ini agar ketika truk tiba di gerbang, Security cukup men-scan Nomor Resi Anda.
                    </Text>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Nama Ekspedisi Luar" name="supplierName">
                            <Input placeholder="Contoh: PT Kargo Kilat, Deliveree" />
                        </Form.Item>
                        <Form.Item label="No. Resi / Surat Jalan Ekspedisi" name="manifestNo">
                            <Input placeholder="Contoh: KILAT-123456" />
                        </Form.Item>
                    </div>
                </div>

                <Divider>Daftar Barang (SKU)</Divider>

                <Form.List name="items" rules={[{
                    validator: async (_, items) => {
                        if (!items || items.length < 1) {
                            return Promise.reject(new Error('Minimal tambahkan 1 barang'));
                        }
                    }
                }]}>
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'itemId']}
                                        rules={[{ required: true, message: 'Pilih SKU' }]}
                                        style={{ width: '400px' }}
                                    >
                                        <Select placeholder="Pilih Barang" showSearch optionFilterProp="children">
                                            {items.map(i => (
                                                <Select.Option key={i.id} value={i.id}>
                                                    {i.code} - {i.name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'expectedQty']}
                                        rules={[{ required: true, message: 'Isi Qty' }]}
                                    >
                                        <InputNumber placeholder="Qty" min={1} style={{ width: '150px' }} />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} className="text-red-500" />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Tambah Barang
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
}
