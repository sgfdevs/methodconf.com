import type { SponsorTier } from '@/data/types';
import { parseCardSize, SponsorCard } from '@/components/SponsorCard';

export interface SponsorTierProps {
    tier: SponsorTier;
}

export function SponsorTierItem({ tier }: SponsorTierProps) {
    const title = tier.properties?.title;
    const logoSize = parseCardSize(tier.properties?.logoSizes) ?? 'medium';

    const sponsors =
        tier.properties?.sponsors?.items
            .map((item) => item.content)
            .filter((content) => content.contentType === 'sponsor') ?? [];

    return (
        <div>
            {title ? <h3>{title}</h3> : null}
            {sponsors.map((sponsor) => (
                <SponsorCard
                    key={sponsor.id}
                    sponsor={sponsor}
                    cardSize={logoSize}
                />
            ))}
        </div>
    );
}
