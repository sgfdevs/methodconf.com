import React, { CSSProperties } from 'react';
import Image from 'next/image';
import { ParsedSession } from '@/data/types';
import { format } from 'date-fns';
import { imageUrl } from '@/data/umbraco/imageUrl';

export interface SpeakerCardProps {
    session: ParsedSession;
    style?: CSSProperties;
}

export function SpeakerCard({ session, style }: SpeakerCardProps) {
    const { start, description, speaker } = session.properties;

    const markup = description?.markup;
    const profileImage = speaker?.properties.profileImage?.[0];

    return (
        <div key={session.id} style={style} className="bg-gray-100 p-8">
            {start ? (
                <time className="text-2xl font-thin">
                    {format(start, 'h:mm a')}
                </time>
            ) : null}
            <div className="flex">
                {profileImage ? (
                    <Image
                        src={imageUrl(profileImage.url, {
                            width: 100,
                            height: 100,
                        })}
                        width={100}
                        height={100}
                        alt={`${speaker.name} profile image`}
                    />
                ) : null}
                <h4 className="text-3xl font-bold">{session.name}</h4>
            </div>
            <div
                dangerouslySetInnerHTML={{
                    __html: markup ?? '',
                }}
            />
        </div>
    );
}
