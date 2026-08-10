"use client";

import React, { useRef } from 'react';
import { Row, Col, Statistic, Card, Breadcrumb } from 'antd';
import { AppstoreOutlined, BuildOutlined, CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import StockTable from './_components/StockTable';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';

export default function StockPage() {
    const tableRef = useRef<{ fetchInventory: () => void }>(null);

    return (
        <div className="flex flex-col">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Inventory' }, { title: 'Stock Table' }]} />

            <ToolbarWrapper>
                <ButtonToolbar message="Refresh Data" icon={<ReloadOutlined />} onClick={() => tableRef.current?.fetchInventory()} />
            </ToolbarWrapper>

            {/* Statistik Cepat */}
            <Row gutter={16}>
                <Col span={8}>
                    <Card variant="borderless" className="shadow-sm rounded-xl bg-gradient-to-br from-blue-50 to-white">
                        <Statistic
                            title="Total Item Unik (SKU)"
                            value={156}
                            prefix={<AppstoreOutlined className="text-blue-500" />}
                            styles={{ content: { color: '#1677ff', fontWeight: 'bold' } }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="shadow-sm rounded-xl bg-gradient-to-br from-green-50 to-white">
                        <Statistic
                            title="Total Kuantitas Fisik"
                            value={4520}
                            prefix={<BuildOutlined className="text-green-500" />}
                            styles={{ content: { color: '#52c41a', fontWeight: 'bold' } }}
                            suffix="Unit"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card variant="borderless" className="shadow-sm rounded-xl bg-gradient-to-br from-purple-50 to-white">
                        <Statistic
                            title="Palet Siap Kirim (Available)"
                            value={120}
                            prefix={<CheckCircleOutlined className="text-purple-500" />}
                            styles={{ content: { color: '#722ed1', fontWeight: 'bold' } }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Tabel Data Stok */}
            <StockTable />
        </div>
    );
}
