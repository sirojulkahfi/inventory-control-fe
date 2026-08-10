"use client";

import React from 'react';
import { Breadcrumb } from 'antd';
import PutawayScanner from './_components/PutawayScanner';
import ToolbarWrapper from '@/components/ui/ToolbarWrapper';
import ButtonToolbar from '@/components/ui/ButtonToolbar';

export default function PutawayPage() {
    return (
        <div className="flex flex-col">
            <Breadcrumb style={{ marginBottom: 16 }} items={[{ title: 'Inbound' }, { title: 'Putaway' }]} />

            <ToolbarWrapper>
                <div></div>
            </ToolbarWrapper>

            <div className="mt-2">
                <PutawayScanner />
            </div>
        </div>
    );
}
