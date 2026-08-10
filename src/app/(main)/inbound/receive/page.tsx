"use client";

import React, { useRef } from 'react';
import { Card, Breadcrumb } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import ReceiveTable from './_components/ReceiveTable';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';

export default function ReceivePage() {
    const tableRef = useRef<{ fetchReceipts: () => void }>(null);

    return (
        <div className="flex flex-col">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Inbound' }, { title: 'Receiving & QC' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={() => tableRef.current?.fetchReceipts()} />
            </ToolbarWrapper>

            <Card className="shadow-sm rounded-xl overflow-hidden mt-2" styles={{ body: { padding: 0 } }}>
                <ReceiveTable ref={tableRef} />
            </Card>
        </div>
    );
}
