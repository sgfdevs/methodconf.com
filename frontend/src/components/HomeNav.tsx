import Image, { getImageProps } from 'next/image';
import { Navigation } from '@/components/Navigation';
import { CONFERENCE_DATE, SPEAKER_LINK, TICKET_LINK } from '@/config';
import logo from '../../public/method-logo.svg';
import skyline from '../../public/skyline.svg';
import skylineMobile from '../../public/skyline-mobile.svg';
import headerGradient from '../../public/header-gradient.svg';
import { format } from 'date-fns';

export function HomeNav() {
    const { props: headerGradientImg } = getImageProps({
        src: headerGradient,
        alt: '',
    });

    return (
        <header>
            <div className="w-full bg-secondary text-white flex flex-col justify-between">
                <div className="content-container relative text-center pt-20">
                    <Image
                        className="max-w-full mx-auto"
                        src={logo}
                        alt="Method Logo"
                    />
                    <h1 className="text-2xl lg:text-5xl lg:font-thin mt-9">
                        <span className="sr-only">Method Conference </span>
                        {format(CONFERENCE_DATE, 'EEEE, MMMM do, yyyy')}, 2024
                        in Springfield, MO
                    </h1>
                    <p className="text-lg mt-5">
                        An immersive day of code, content, and design
                    </p>
                    <br />
                    <a
                        href={TICKET_LINK}
                        target="_blank"
                        className="button secondary inline-block"
                    >
                        Buy Tickets
                    </a>
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
                    { url: TICKET_LINK, title: 'Tickets' },
                    { url: '#location', title: 'Location' },
                    { url: '#sponsor', title: 'Sponsor' },
                ]}
            />
        </header>
    );
}
