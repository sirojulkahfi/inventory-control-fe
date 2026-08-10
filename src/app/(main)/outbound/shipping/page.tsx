"use client";

import React, { useRef } from 'react';
import { Card, Breadcrumb } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import DispatchTable from './_components/DispatchTable';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';

export default function ShippingPage() {
    const tableRef = useRef<{ fetchShipping: () => void }>(null);

    return (
        <div className="flex flex-col">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Outbound' }, { title: 'Shipping & DO' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={() => tableRef.current?.fetchShipping()} />
            </ToolbarWrapper>

            <Card className="shadow-sm rounded-xl overflow-hidden mt-2" styles={{ body: { padding: 0 } }}>
                <DispatchTable ref={tableRef} />
            </Card>
        </div>
    );
}
