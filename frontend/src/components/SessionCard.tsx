'use client';
import type { CSSProperties } from 'react';
import React from 'react';
import Image from 'next/image';
import { Accordion } from '@szhsin/react-accordion';
import type { ParsedSession } from '@/data/types';
import { imageUrl } from '@/data/umbraco/imageUrl';
import styles from './SessionCard.module.css';
import { formatDate } from '@/util';
import Link from 'next/link';
import { RichText } from '@/components/RichText';
import { CustomAccordionItem } from '@/components/CustomAccordionItem';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface SpeakerCardProps {
    session: ParsedSession;
    style?: CSSProperties;
    disableSpeakerLinks?: boolean;
    className?: string;
}

export function SessionCard({
    session,
    style,
    disableSpeakerLinks = false,
    className = '',
}: SpeakerCardProps) {
    const { start, description, speakers } = session.properties ?? {};

    const speakerContent = speakers?.find((s) => s.contentType === 'speaker');

    const markup = description?.markup;
    const profileImage = speakerContent?.properties?.profileImage?.[0];
    const jobTitle = speakerContent?.properties?.jobTitle;

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
                    alt={`${speakerContent.name} profile image`}
                    className="w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] xl:w-[80px] xl:h-[80px] rounded-full mr-3"
                />
            ) : null}
            <div>
                <h3 className="text-base sm:text-lg xl:text-3xl font-bold">
                    {session.name}
                </h3>
                {speakerContent ? (
                    <p className="text-sm sm:text-base mt-2">
                        {disableSpeakerLinks ? (
                            speakerContent.name
                        ) : (
                            <Link
                                href={speakerContent.route.path}
                                className="text-primary"
                            >
                                {speakerContent.name}
                            </Link>
                        )}

                        {jobTitle ? `: ${jobTitle}` : ''}
                    </p>
                ) : null}
            </div>
        </div>
    );

    return (
        <div
            key={session.id}
            style={style}
            className={`bg-gray-100 p-4 xl:p-8 ${className} ${styles.accordionWrapper}`}
        >
            {start ? (
                <time className="text-lg xl:text-2xl font-thin">
                    {formatDate(start, 'h:mm a')}
                </time>
            ) : null}
            {markup ? (
                <Accordion transition transitionTimeout={250}>
                    <CustomAccordionItem
                        header={({ state, buttonProps }) => (
                            <div className="flex justify-between items-center">
                                {header}
                                <button
                                    className="text-primary font-medium text-lg ml-8 flex items-center"
                                    {...buttonProps}
                                >
                                    {state.isEnter ? 'Less' : 'More'}
                                    <span className="text-black text-sm ml-1">
                                        <FontAwesomeIcon
                                            className={`transition-[transform] duration-300 ease-[cubic-bezier(0,0,0,1)] ${state.isEnter ? 'rotate-180' : ''}`}
                                            icon={faChevronDown}
                                        />
                                    </span>
                                </button>
                            </div>
                        )}
                    >
                        <RichText className="mt-4" markup={markup} />
                    </CustomAccordionItem>
                </Accordion>
            ) : (
                <h4>{header}</h4>
            )}
        </div>
    );
}
