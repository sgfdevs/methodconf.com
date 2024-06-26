import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faYoutube,
    faXTwitter,
    faLinkedin,
    faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import sgfFlag from '../../public/sgf-flag.svg';

export function Footer() {
    return (
        <footer className="content-container mx-auto flex justify-between items-center pt-4 pb-8 sm:pt-12 sm:pb-16 flex-col sm:flex-row-reverse">
            <section className="mb-5 sm:mb-0">
                <nav className="flex space-x-6">
                    {[
                        {
                            icon: faLinkedin,
                            url: 'https://www.linkedin.com/company/methodconf',
                        },
                        {
                            icon: faInstagram,
                            url: 'https://www.instagram.com/methodconference/',
                        },
                        {
                            icon: faXTwitter,
                            url: 'https://twitter.com/methodconf',
                        },
                        {
                            icon: faYoutube,
                            url: 'https://www.youtube.com/c/sgfdevs/videos',
                        },
                    ].map(({ icon, url }) => (
                        <a
                            key={url}
                            href={url}
                            target="_blank"
                            className="text-primary text-lg"
                        >
                            <FontAwesomeIcon icon={icon} />
                        </a>
                    ))}
                </nav>
            </section>

            <section className="flex items-center flex-col sm:flex-row">
                <div className="w-16 mb-5 sm:mb-0">
                    <Image
                        className="max-w-full mx-auto"
                        src={sgfFlag}
                        alt="Springfield Flag"
                    />
                </div>
                <p className="ml-0 sm:ml-4">
                    We ❤️ Springfield.{' '}
                    <span>
                        ©{new Date().getFullYear()} Springfield Devs. 501(c)6
                    </span>
                </p>
            </section>
        </footer>
    );
}
