"use client";

import React from 'react';
import { Layout } from 'antd';

const { Footer: AntFooter } = Layout;

export default function Footer() {
    return (
        <AntFooter
            className="batik-bg shadow-sm"
            style={{
                height: '48px',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
            }}
        >
            <span className="text-white text-sm font-medium drop-shadow-sm">
                RJL -Inventory System © {new Date().getFullYear()} RJL DevOps
            </span>
        </AntFooter>
    );
}