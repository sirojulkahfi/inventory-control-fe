"use client";

import React, { useRef } from 'react';
import { Breadcrumb } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import PickScanner from './_components/PickScanner';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';

export default function PickingPage() {
    const scannerRef = useRef<{ fetchTasks: () => void }>(null);

    return (
        <div className="flex flex-col max-w-3xl mx-auto w-full">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Outbound' }, { title: 'Picking Task' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={() => scannerRef.current?.fetchTasks()} />
            </ToolbarWrapper>

            <div className="mt-2">
                <PickScanner ref={scannerRef} />
            </div>
        </div>
    );
}
