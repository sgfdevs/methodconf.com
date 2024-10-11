import Link from 'next/link';
import Image from 'next/image';
import { NewsletterForm } from '@/components/NewsletterForm';
import type { RootPageProps } from '@/app/[conference]/page';
import { APPLE_APP_STORE_LINK, GOOGLE_PLAY_STORE_LINK } from '@/config';
import appStore from '../../../public/app-store.svg';
import playStore from '../../../public/play-store.svg';

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
                        className="button inline-block mb-8"
                    >
                        Register Now
                    </Link>
                    <h3 className="font-bold text-xl lg:text-2xl mb-4">
                        Download Our Mobile App!
                    </h3>
                    <div className="flex space-x-4">
                        <Link
                            className="block"
                            href={APPLE_APP_STORE_LINK}
                            title="Download iOS app"
                        >
                            <Image
                                src={appStore}
                                alt="Download on the App Store"
                                height={55}
                            />
                        </Link>
                        <Link
                            className="block"
                            href={GOOGLE_PLAY_STORE_LINK}
                            title="Download android app"
                        >
                            <Image
                                src={playStore}
                                alt="Get it on Google Play"
                                height={55}
                            />
                        </Link>
                    </div>
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
