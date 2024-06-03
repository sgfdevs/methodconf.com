import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';

config.autoAddCss = false;

const sourceSans = Source_Sans_3({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Method Conference - October 12th 2024 - Springfield, MO',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={sourceSans.className}>{children}</body>
        </html>
    );
}
