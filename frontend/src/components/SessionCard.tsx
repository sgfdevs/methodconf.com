'use client';
import React, { CSSProperties } from 'react';
import Image from 'next/image';
import { Accordion, AccordionItem } from '@szhsin/react-accordion';
import { ParsedSession } from '@/data/types';
import { format } from 'date-fns';
import { imageUrl } from '@/data/umbraco/imageUrl';
import styles from './SessionCard.module.css';

export interface SpeakerCardProps {
    session: ParsedSession;
    style?: CSSProperties;
}

export function SessionCard({ session, style }: SpeakerCardProps) {
    const { start, description, speaker } = session.properties;

    const markup = description?.markup;
    const profileImage = speaker?.properties.profileImage?.[0];

    const header = (
        <div className="flex items-center w-full text-left">
            {profileImage ? (
                <Image
                    src={imageUrl(profileImage.url, {
                        width: 100,
                        height: 100,
                    })}
                    width={100}
                    height={100}
                    alt={`${speaker.name} profile image`}
                    className="w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] xl:w-[80px] xl:h-[80px] rounded-full mr-3"
                />
            ) : null}
            <div>
                <p className="text-base sm:text-lg xl:text-3xl font-bold">
                    {session.name}
                </p>
                {speaker ? (
                    <p className="text-sm sm:text-base mt-2">
                        {speaker.name}: {speaker.properties.jobTitle}
                    </p>
                ) : null}
            </div>
        </div>
    );

    return (
        <div
            key={session.id}
            style={style}
            className={`bg-gray-100 p-4 xl:p-8 ${styles.accordionWrapper}`}
        >
            {start ? (
                <time className="text-lg xl:text-2xl font-thin">
                    {format(start, 'h:mm a')}
                </time>
            ) : null}
            {markup ? (
                <Accordion transition transitionTimeout={250}>
                    <AccordionItem
                        headingTag="h4"
                        header={({ state }) => {
                            return (
                                <div className="flex justify-between items-center">
                                    {header}
                                    <p className="text-primary font-medium text-lg ml-8">
                                        {state.status === 'entered'
                                            ? 'Less'
                                            : 'More'}
                                    </p>
                                </div>
                            );
                        }}
                    >
                        <div
                            className="mt-4 prose"
                            dangerouslySetInnerHTML={{
                                __html: markup,
                            }}
                        />
                    </AccordionItem>
                </Accordion>
            ) : (
                <h4>{header}</h4>
            )}
        </div>
    );
}