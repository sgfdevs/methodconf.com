import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';
import { Footer } from '@/components/Footer';

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
        <html lang="en" className="scroll-smooth">
            <body className={`${sourceSans.className} font-light`}>
                {children}
                <Footer />
            </body>
        </html>
    );
}
