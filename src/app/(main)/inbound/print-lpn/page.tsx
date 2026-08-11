import React from 'react';
import { Breadcrumb } from 'antd';
import PrintLpnTable from './_components/PrintLpnTable';

export default function PrintLpnPage() {
    return (
        <>
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Inbound' }, { title: 'Print LPN (Barcode)' }]} />
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="mb-6">
                    <h2 className="text-xl font-bold m-0">Print LPN (Barcode Palet)</h2>
                    <p className="text-gray-500 m-0">
                        Cetak label barcode (LPN) untuk barang yang sudah melalui proses Quality Control (QC).
                    </p>
                </div>

                <PrintLpnTable />
            </div>
        </>
    );
}
