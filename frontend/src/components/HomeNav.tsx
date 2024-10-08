import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { formatDate } from '@/util';
import type { ParsedConference } from '@/data/types';
import type { RootPageProps } from '@/app/[conference]/page';
import logo from '../../public/method-logo.svg';
import skyline from '../../public/skyline.svg';
import skylineMobile from '../../public/skyline-mobile.svg';
import headerGradient from '../../public/header-gradient.svg';

interface HomeNavProps extends RootPageProps {
    conference: ParsedConference;
}

export function HomeNav({ params, conference }: HomeNavProps) {
    const { props: headerGradientImg } = getImageProps({
        src: headerGradient,
        alt: '',
    });

    const { date } = conference.properties;

    return (
        <header>
            <div className="w-full bg-secondary text-white flex flex-col justify-between">
                <div className="content-container relative text-center pt-20">
                    <Image
                        className="max-w-full mx-auto"
                        src={logo}
                        alt="Method Logo"
                    />
                    <h1 className="text-2xl md:text-4xl lg:text-5xl lg:font-thin mt-9">
                        <span className="sr-only">Method Conference </span>
                        {date
                            ? `${formatDate(date, 'EEEE, MMMM do, yyyy')} in `
                            : ''}
                        Springfield, MO
                    </h1>
                    <p className="text-xl md:text-2xl font-medium mt-5">
                        An immersive day of{' '}
                        <span className="text-primary">code</span>,{' '}
                        <span className="text-primary">content</span>, and{' '}
                        <span className="text-primary">more</span>
                    </p>
                    <br />
                    <br />
                    <Link
                        href={`/${params.conference}/register/`}
                        className="button secondary inline-block"
                    >
                        Register Now
                    </Link>
                </div>

                <div
                    className="relative bottom-0 pt-14 bg-cover"
                    style={{ backgroundImage: `url(${headerGradientImg.src})` }}
                >
                    <Image
                        className="object-cover w-full hidden sm:block"
                        src={skyline}
                        alt=""
                    />
                    <Image
                        className="object-cover w-full block sm:hidden"
                        src={skylineMobile}
                        alt=""
                    />
                </div>
            </div>

            <Navigation
                links={[
                    {
                        url: `/${params.conference}/register/`,
                        title: 'Register',
                    },
                    { url: '#schedule', title: 'Schedule' },
                    { url: '#location', title: 'Location' },
                ]}
            />
        </header>
    );
}
