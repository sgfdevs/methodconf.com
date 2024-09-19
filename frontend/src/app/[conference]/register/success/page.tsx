import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: { index: false },
};

export default function SuccessPage() {
    return (
        <section className="py-24 md:py-32">
            <div className="content-container text-center">
                <h1 className="text-2xl md:text-5xl font-bold mb-2 md:mb-8">
                    Thank You for Registering
                </h1>
                <p className="text-md md:text-2xl">
                    We’ve sent a confirmation email to your inbox.
                </p>
            </div>
        </section>
    );
}
