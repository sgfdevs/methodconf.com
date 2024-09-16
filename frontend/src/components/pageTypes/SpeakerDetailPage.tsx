import Image from 'next/image';
import type { IconDefinition } from '@fortawesome/free-brands-svg-icons';
import {
    faXTwitter,
    faLinkedin,
    faInstagram,
} from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import type { ParsedConference, Speaker } from '@/data/types';
import { getSessionsForSpeaker } from '@/data/getSessionsForSpeaker';
import { imageUrl } from '@/data/umbraco/imageUrl';
import { SessionCard } from '@/components/SessionCard';
import { RichText } from '@/components/RichText';

export interface SpeakerDetailPageProps {
    conference: ParsedConference;
    speaker: Speaker;
}

export async function SpeakerDetailPage({
    conference,
    speaker,
}: SpeakerDetailPageProps) {
    const sessions = await getSessionsForSpeaker(conference.id, speaker.id);

    const { bio, jobTitle, profileImage } = speaker.properties ?? {};

    const links = getSpeakerLinks(speaker);

    const image = profileImage?.[0];

    return (
        <>
            <section className="bg-gray-100 py-14">
                <div className="content-container">
                    <div className="flex flex-wrap flex-col md:flex-row-reverse">
                        <div className="w-full mb-5 md:mb-0 md:w-1/3">
                            {image ? (
                                <Image
                                    src={imageUrl(image.url, {
                                        width: 500,
                                        height: 560,
                                    })}
                                    height={image.height ?? 200}
                                    width={image.width ?? 300}
                                    alt={`${speaker.name} profile image`}
                                    className="mx-auto block w-full max-md:max-w-[400px]"
                                />
                            ) : null}
                        </div>
                        <div className="w-full md:w-2/3 md:pr-5">
                            <h1 className="text-lg md:text-3xl mb-4">
                                <span className="font-bold">
                                    {speaker.name}
                                </span>
                                {jobTitle ? `: ${jobTitle}` : ''}
                            </h1>
                            {bio?.markup ? (
                                <RichText markup={bio.markup} />
                            ) : null}
                            <div className="mt-4 flex flex-wrap space-x-3">
                                {links.map(({ title, url, icon }) => (
                                    <a
                                        key={title}
                                        href={url}
                                        target="_blank"
                                        title={title}
                                        className="text-primary text-2xl"
                                    >
                                        <FontAwesomeIcon icon={icon} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {sessions.length > 0 ? (
                <section className="py-14">
                    <div className="content-container">
                        <h2 className="text-lg md:text-3xl font-thin mb-5">
                            Sessions
                        </h2>
                        {sessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                disableSpeakerLinks={true}
                            />
                        ))}
                    </div>
                </section>
            ) : null}
        </>
    );
}

interface SpeakerLink {
    url: string;
    icon: IconDefinition;
    title: string;
}

function getSpeakerLinks(speaker: Speaker): SpeakerLink[] {
    const { websiteUrl, instagramUrl, linkedInUrl, xTwitterUrl } =
        speaker.properties ?? {};

    const links: SpeakerLink[] = [];

    if (websiteUrl) {
        links.push({
            url: websiteUrl,
            icon: faGlobe,
            title: `${speaker.name} Website`,
        });
    }

    if (xTwitterUrl) {
        links.push({
            url: xTwitterUrl,
            icon: faXTwitter,
            title: `${speaker.name} Twitter`,
        });
    }

    if (linkedInUrl) {
        links.push({
            url: linkedInUrl,
            icon: faLinkedin,
            title: `${speaker.name} LinkedIn`,
        });
    }

    if (instagramUrl) {
        links.push({
            url: instagramUrl,
            icon: faInstagram,
            title: `${speaker.name} Instagram`,
        });
    }

    return links;
}
