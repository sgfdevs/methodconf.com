import Image from 'next/image';
import type { Sponsor } from '@/data/types';
import { imageUrl } from '@/data/umbraco/imageUrl';

export interface SponsorCardProps {
    sponsor: Sponsor;
    cardSize: CardSize;
}

export type CardSize = 'large' | 'medium' | 'small';

export function SponsorCard({ sponsor, cardSize }: SponsorCardProps) {
    const {
        title,
        logo,
        darkBackground = false,
        url,
    } = sponsor.properties ?? {};

    const image = logo?.[0];

    let cardWidth = 'w-full lg:w-1/2';
    let minHeight = 'min-h-[180px] sm:min-h-[275px]';
    let imageHeight = 375;

    if (cardSize === 'medium') {
        minHeight = 'min-h-[80px] sm:min-h-[150px]';
        imageHeight = 240;
        cardWidth = 'w-1/2 lg:w-1/3';
    } else if (cardSize === 'small') {
        minHeight = 'min-h-[75px] sm:min-h-[130px]';
        imageHeight = 175;
        cardWidth = 'w-1/2 sm:w-1/3 lg:w-1/4';
    }

    const content = (
        <div className={`flex items-center justify-center h-full`}>
            {image ? (
                <Image
                    src={imageUrl(image.url, {
                        height: imageHeight,
                    })}
                    height={image.height ?? 200}
                    width={image.width ?? 300}
                    quality={100}
                    alt={`${title} logo`}
                />
            ) : (
                <p>{title}</p>
            )}
        </div>
    );

    let cardStyles = `p-2 sm:p-5 shadow-[0_8px_15px_rgba(0,0,0,0.1)] rounded-2xl h-full ${minHeight}`;

    if (darkBackground) {
        cardStyles += ' bg-black';
    }

    const contentInCard = url ? (
        <a
            className={`block ${cardStyles}`}
            href={url}
            target="_blank"
            title={title ? title : undefined}
        >
            {content}
        </a>
    ) : (
        <div className={cardStyles}>{content}</div>
    );

    return <div className={`p-2 ${cardWidth}`}>{contentInCard}</div>;
}

export function parseCardSize(str: string | null = ''): CardSize | undefined {
    str = str?.toLowerCase() ?? '';

    switch (str) {
        case 'large':
        case 'medium':
        case 'small':
            return str;
    }
}
