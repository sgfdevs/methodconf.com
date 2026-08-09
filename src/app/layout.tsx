import type { Metadata } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { Source_Sans_3 } from 'next/font/google';
import PlausibleProvider from 'next-plausible';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';
import { Footer } from '@/components/Footer';
import { getSiteUrl } from '@/serverConfig';

config.autoAddCss = false;

const sourceSans = Source_Sans_3({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
    await connection();

    return {
        title: {
            template: 'Method Conference - %s',
            default: 'Method Conference - October 12th 2024 - Springfield, MO',
        },
        metadataBase: getSiteUrl(),
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
            <body
                className={`${sourceSans.className} font-light`}
                suppressHydrationWarning
            >
                <PlausibleProvider src="https://plausible.sgf.dev/js/pa-MKQsdxqo5_oFk0NmM56b1.js">
                    {children}
                    <Footer />
                </PlausibleProvider>
            </body>
        </html>
    );
}
