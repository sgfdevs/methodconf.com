import { SPEAKER_LINK } from '@/constants';
import { NewsletterForm } from '@/components/NewsletterForm';

export function HomeIntro() {
    return (
        <section className="flex flex-col lg:flex-row">
            <div className="bg-gray-100 py-16 lg:w-1/2 lg:px-5">
                <div className="container mx-auto lg:max-w-[500px]">
                    <div className="mb-8">
                        <h2 className="font-bold text-xl lg:text-4xl">
                            Invest In Yourself and Hone Your Craft
                        </h2>
                        <p>
                            Method Conference Springfield, MO is an immersive
                            one-day conference with 6 sessions, workshops and
                            keynote with an intense focus on digital
                            development, design, UX, content, code, and more.
                        </p>
                    </div>
                    <a href={SPEAKER_LINK} className="button inline-block">
                        Sign Up to Speak
                    </a>
                </div>
            </div>
            <div className="lg:w-1/2 lg:px-5">
                <div className="max-w-[650px] lg:max-w-[400px] mx-auto py-8 lg:pt-16">
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
