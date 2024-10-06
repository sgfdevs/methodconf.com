import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Source_Sans_3 } from 'next/font/google';
import PlausibleProvider from 'next-plausible';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './globals.css';
import { Footer } from '@/components/Footer';
import { NEXT_PUBLIC_SITE_URL } from '@/config';

config.autoAddCss = false;

const sourceSans = Source_Sans_3({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: {
        template: 'Method Conference - %s',
        default: 'Method Conference - October 12th 2024 - Springfield, MO',
    },
    metadataBase: NEXT_PUBLIC_SITE_URL,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <head>
                <PlausibleProvider
                    domain="methodconf.com"
                    customDomain="https://plausible.sgf.dev"
                />
            </head>
            <body
                className={`${sourceSans.className} font-light`}
                suppressHydrationWarning
            >
                {children}
                <Footer />
            </body>
        </html>
    );
}
