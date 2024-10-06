import Link from 'next/link';
import { NewsletterForm } from '@/components/NewsletterForm';
import type { RootPageProps } from '@/app/[conference]/page';

export type IntroAndEmailSignupBlockProps = RootPageProps;

export function IntroAndEmailSignupBlock({
    params,
}: IntroAndEmailSignupBlockProps) {
    return (
        <section className="flex flex-col lg:flex-row">
            <div className="bg-gray-100 py-16 lg:w-1/2 lg:px-5">
                <div className="content-container lg:max-w-[500px]">
                    <div className="mb-8">
                        <h2 className="font-bold text-xl lg:text-4xl">
                            Invest In Yourself and Hone Your Craft
                        </h2>
                        <p>
                            Method Conference Springfield, MO is an immersive
                            one-day conference with three tracks, two one-hour
                            session tracks, a workshop track, and a keynote. All
                            with an intense focus on digital development,
                            design, UX, content, code, and more.
                        </p>
                    </div>
                    <Link
                        href={`/${params.conference}/register/`}
                        className="button inline-block ml-2"
                    >
                        Register Now
                    </Link>
                </div>
            </div>
            <div className="lg:w-1/2 lg:px-5">
                <div className="content-container max-w-[650px] lg:max-w-[400px] mx-auto py-8 lg:pt-16">
                    <p className="font-bold text-xl mb-4">
                        Stay in-the-know about event updates and new speaker
                        announcements.
                    </p>
                    <NewsletterForm />
                </div>
            </div>
        </section>
    );
}
