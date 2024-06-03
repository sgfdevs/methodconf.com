import Image, { getImageProps } from 'next/image';
import logo from '../../public/method-logo.svg';
import skyline from '../../public/skyline.svg';
import skylineMobile from '../../public/skyline-mobile.svg';
import headerGradient from '../../public/header-gradient.svg';

export default function Home() {
    const { props: headerGradientImg } = getImageProps({
        src: headerGradient,
        alt: '',
    });

    return (
        <main className="w-full min-h-screen bg-secondary text-white flex flex-col justify-between">
            <div className="container mx-auto px-4 relative text-center pt-20">
                <Image
                    className="max-w-full mx-auto"
                    src={logo}
                    alt="Method Logo"
                />
                <h2 className="text-2xl lg:text-5xl lg:font-thin mt-9">
                    October 12th 2024 @ The{' '}
                    <a
                        href="https://efactory.missouristate.edu/"
                        target="_blank"
                        className="underline underline-offset-2"
                    >
                        efactory
                    </a>
                </h2>
                <p className="text-lg mt-5">
                    Springfield&apos;s Developer Conference Returns
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
        </main>
    );
}
