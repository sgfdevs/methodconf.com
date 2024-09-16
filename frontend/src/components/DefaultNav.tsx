import Image from 'next/image';
import type { ParsedConference } from '@/data/types';
import logo from '../../public/method-logo.svg';
import { formatDate } from '@/util';
import { Navigation } from '@/components/Navigation';

export interface DefaultNavProps {
    conference: ParsedConference;
    params: {
        conference: string;
    };
}

export function DefaultNav({ conference, params }: DefaultNavProps) {
    const { date } = conference.properties;

    return (
        <header>
            <div className="w-full bg-secondary text-white flex flex-col justify-between">
                <div className="content-container relative text-center py-14">
                    <Image
                        className="max-w-full mx-auto"
                        src={logo}
                        alt="Method Logo"
                    />
                    <h1 className="text-2xl lg:text-5xl lg:font-thin mt-9">
                        <span className="sr-only">Method Conference </span>
                        {date
                            ? `${formatDate(date, 'EEEE, MMMM do, yyyy')} in `
                            : ''}
                        Springfield, MO
                    </h1>
                    <p className="text-lg mt-5">
                        An immersive day of code, content, and design
                    </p>
                    <br />
                </div>
            </div>

            <Navigation
                links={[
                    { url: `/${params.conference}/`, title: 'Event Details' },
                    { url: `/${params.conference}/tickets`, title: 'Tickets' },
                ]}
            />
        </header>
    );
}
