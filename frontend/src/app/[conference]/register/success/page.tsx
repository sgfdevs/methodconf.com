import type { Metadata } from 'next';
import Link from 'next/link';

export interface SuccessPageProps {
    params: {
        conference: string;
    };
}

export const metadata: Metadata = {
    robots: { index: false },
};

export default function SuccessPage({ params }: SuccessPageProps) {
    return (
        <section className="py-24 md:py-32">
            <div className="content-container text-center">
                <h1 className="text-2xl md:text-5xl font-bold mb-2 md:mb-8">
                    Thank You for Registering
                </h1>
                <p className="text-md md:text-2xl">
                    We’ve sent a confirmation email to your inbox.
                </p>
                <p className="text-md md:text-2xl">
                    If you don{`'`}t receive that email or have any other issues
                    please email{' '}
                    <a
                        href="mailto:info@methodconf.com"
                        className="text-primary"
                    >
                        info@methodconf.com
                    </a>
                </p>
                <br />
                <Link
                    href={`/${params.conference}/`}
                    className="button secondary inline-block"
                >
                    Back Home
                </Link>
            </div>
        </section>
    );
}
