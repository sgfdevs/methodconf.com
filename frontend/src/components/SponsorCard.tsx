import type { Sponsor } from '@/data/types';

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

    return <div>{title}</div>;
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
