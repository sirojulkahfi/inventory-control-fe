"use client";

import React from 'react';

export default function Footer() {
    return (
        <footer className="batik-bg h-12 px-6 flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white text-sm font-medium drop-shadow-sm">
                RJL -Inventory System © {new Date().getFullYear()} RJL DevOps
            </span>
        </footer>
    );
}