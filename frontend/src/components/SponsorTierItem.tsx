import type { SponsorTier } from '@/data/types';
import { parseCardSize, SponsorCard } from '@/components/SponsorCard';

export interface SponsorTierProps {
    tier: SponsorTier;
}

export function SponsorTierItem({ tier }: SponsorTierProps) {
    const title = tier.properties?.title;
    const cardSize = parseCardSize(tier.properties?.logoSizes) ?? 'medium';

    const sponsors =
        tier.properties?.sponsors?.items
            .map((item) => item.content)
            .filter((content) => content.contentType === 'sponsor') ?? [];

    const headingStyles =
        cardSize === 'large'
            ? 'text-xl md:text-4xl font-bold'
            : 'text-xl md:text-3xl font-semibold';

    return (
        <div>
            {title ? (
                <div className="flex items-center mb-4 sm:mb-5">
                    <div className="bg-primary h-[4px] flex-1"></div>
                    <div className="px-5 text-center">
                        <h3 className={headingStyles}>{title}</h3>
                    </div>
                    <div className="bg-primary h-[4px] flex-1"></div>
                </div>
            ) : null}
            {sponsors.length > 0 ? (
                <div
                    className={`${cardSize === 'small' ? 'px-4' : ''} sm:px-10 mb-8 sm:mb-12`}
                >
                    <div className="flex flex-wrap justify-center -m-2">
                        {sponsors.map((sponsor) => (
                            <SponsorCard
                                key={sponsor.id}
                                sponsor={sponsor}
                                cardSize={cardSize}
                            />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
