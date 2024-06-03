import Image, { getImageProps } from 'next/image';
import logo from '../../public/method-logo.svg';
import skyline from '../../public/skyline.svg';
import skylineMobile from '../../public/skyline-mobile.svg';
import headerGradient from '../../public/header-gradient.svg';
import { Navigation } from '@/components/Navigation';

export function HomeNav() {
    const { props: headerGradientImg } = getImageProps({
        src: headerGradient,
        alt: '',
    });

    return (
        <header>
            <div className="w-full bg-secondary text-white flex flex-col justify-between">
                <div className="container mx-auto px-4 relative text-center pt-20">
                    <Image
                        className="max-w-full mx-auto"
                        src={logo}
                        alt="Method Logo"
                    />
                    <h2 className="text-2xl lg:text-5xl lg:font-thin mt-9">
                        Saturday, October 12th, 2024 in Springfield, MO
                    </h2>
                    <p className="text-lg mt-5">
                        An immersive day of code, content, and design
                    </p>
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
                        url: 'https://sessionize.com/method-conference-2024/',
                        title: 'Speak',
                    },
                    { url: '#location', title: 'Location' },
                    { url: '#sponsor', title: 'Sponsor' },
                ]}
            />
        </header>
    );
}
