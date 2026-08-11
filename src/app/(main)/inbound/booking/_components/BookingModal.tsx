import React, { useState, useEffect } from 'react';
import { App } from 'antd';
import { PlusOutlined, MinusCircleOutlined, CarOutlined } from '@ant-design/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface BookingModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    items: any[];
    customers: any[];
    user: any;
}

interface ItemRow {
    itemId: string;
    expectedQty: number | '';
}

export default function BookingModal({ open, onCancel, onSuccess, items, customers, user }: BookingModalProps) {
    const { message } = App.useApp();

    // Form state
    const [customerId, setCustomerId] = useState('');
    const [expectedDate, setExpectedDate] = useState('');
    const [expeditionType, setExpeditionType] = useState<'EXTERNAL' | 'INTERNAL'>('EXTERNAL');
    const [supplierName, setSupplierName] = useState('');
    const [manifestNo, setManifestNo] = useState('');
    const [itemRows, setItemRows] = useState<ItemRow[]>([{ itemId: '', expectedQty: '' }]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setCustomerId(user?.customerId || '');
            setExpectedDate('');
            setExpeditionType('EXTERNAL');
            setSupplierName('');
            setManifestNo('');
            setItemRows([{ itemId: '', expectedQty: '' }]);
            setErrors({});
        }
    }, [open, user]);

    const addItemRow = () => {
        setItemRows(prev => [...prev, { itemId: '', expectedQty: '' }]);
    };

    const removeItemRow = (index: number) => {
        setItemRows(prev => prev.filter((_, i) => i !== index));
    };

    const updateItemRow = (index: number, field: keyof ItemRow, value: string | number) => {
        setItemRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!customerId) newErrors.customerId = 'Wajib dipilih';
        if (!expectedDate) newErrors.expectedDate = 'Wajib diisi';
        if (itemRows.length === 0) newErrors.items = 'Minimal tambahkan 1 barang';
        itemRows.forEach((row, i) => {
            if (!row.itemId) newErrors[`item_${i}_id`] = 'Pilih SKU';
            if (!row.expectedQty || Number(row.expectedQty) < 1) newErrors[`item_${i}_qty`] = 'Isi Qty';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            message.error('Mohon lengkapi semua field yang wajib');
            return;
        }

        setSubmitting(true);
        try {
            const isInternal = expeditionType === 'INTERNAL';

            const payload = {
                data: {
                    customerId,
                    expectedDate: new Date(expectedDate).toISOString(),
                },
                items: itemRows.map(row => ({
                    itemId: row.itemId,
                    expectedQty: Number(row.expectedQty)
                })),
                manifestNo: isInternal ? undefined : manifestNo || undefined,
                supplierName: isInternal ? 'RJL Logistics' : supplierName || undefined
            };

            await api.post('/booking', payload);
            message.success('ASN berhasil dibuat');
            onSuccess();
        } catch (error: any) {
            message.error('Gagal membuat ASN');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Buat Rencana Pengiriman (ASN)</DialogTitle>
                    <DialogDescription>
                        Buat Advance Shipment Notice untuk mengatur rencana pengiriman barang ke gudang.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Customer & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Customer / Pemilik Barang <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                disabled={!!user?.customerId}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            >
                                <option value="">Pilih Customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.customerId && <p className="text-xs text-red-500">{errors.customerId}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Rencana Tanggal Kedatangan <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="date"
                                value={expectedDate}
                                onChange={(e) => setExpectedDate(e.target.value)}
                            />
                            {errors.expectedDate && <p className="text-xs text-red-500">{errors.expectedDate}</p>}
                        </div>
                    </div>

                    {/* Expedition Info */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <CarOutlined className="text-blue-600 text-lg" />
                            <span className="font-semibold text-blue-800 text-base">Informasi Ekspedisi (Opsional Tapi Direkomendasikan)</span>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="expeditionType"
                                    value="EXTERNAL"
                                    checked={expeditionType === 'EXTERNAL'}
                                    onChange={() => setExpeditionType('EXTERNAL')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Pakai Ekspedisi Luar (Customer)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="expeditionType"
                                    value="INTERNAL"
                                    checked={expeditionType === 'INTERNAL'}
                                    onChange={() => setExpeditionType('INTERNAL')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">Pakai RJL Logistics (Internal)</span>
                            </label>
                        </div>

                        {expeditionType === 'EXTERNAL' ? (
                            <>
                                <p className="text-sm text-gray-500 mb-4">
                                    Isi bagian ini agar ketika truk tiba di gerbang, Security cukup men-scan Nomor Resi Anda.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Nama Ekspedisi Luar</label>
                                        <Input
                                            placeholder="Contoh: PT Kargo Kilat, Deliveree"
                                            value={supplierName}
                                            onChange={(e) => setSupplierName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">No. Resi / Surat Jalan Ekspedisi</label>
                                        <Input
                                            placeholder="Contoh: KILAT-123456"
                                            value={manifestNo}
                                            onChange={(e) => setManifestNo(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-3 bg-white rounded border border-blue-100">
                                <p className="text-sm text-gray-500 m-0">
                                    Nomor Manifest/Surat Jalan akan di-generate secara otomatis oleh sistem backend RJL Logistics.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-3 text-gray-500 font-medium">Daftar Barang (SKU)</span>
                        </div>
                    </div>

                    {/* Item Rows */}
                    <div className="space-y-3">
                        {itemRows.map((row, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex-1 space-y-1">
                                    <select
                                        value={row.itemId}
                                        onChange={(e) => updateItemRow(index, 'itemId', e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value="">Pilih Barang</option>
                                        {items.map(i => (
                                            <option key={i.id} value={i.id}>{i.code} - {i.name}</option>
                                        ))}
                                    </select>
                                    {errors[`item_${index}_id`] && <p className="text-xs text-red-500">{errors[`item_${index}_id`]}</p>}
                                </div>
                                <div className="w-[150px] space-y-1">
                                    <Input
                                        type="number"
                                        placeholder="Qty"
                                        min={1}
                                        value={row.expectedQty}
                                        onChange={(e) => updateItemRow(index, 'expectedQty', e.target.value ? Number(e.target.value) : '')}
                                    />
                                    {errors[`item_${index}_qty`] && <p className="text-xs text-red-500">{errors[`item_${index}_qty`]}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItemRow(index)}
                                    className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                                    disabled={itemRows.length <= 1}
                                >
                                    <MinusCircleOutlined className="text-lg" />
                                </button>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={addItemRow}
                        >
                            <PlusOutlined className="mr-2" /> Tambah Barang
                        </Button>
                        {errors.items && <p className="text-xs text-red-500">{errors.items}</p>}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onCancel} disabled={submitting}>
                        Batal
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Menyimpan...' : 'Buat ASN'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
