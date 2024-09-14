import { SectionTitleBar } from '@/components/SectionTitleBar';
import Image from 'next/image';
import type { Sponsors } from '@/data/types';
import logo from '../../../public/method-logo.svg';
import { SponsorTierItem } from '@/components/SponsorTierItem';

export interface SponsorsSectionProps {
    sponsors: Sponsors;
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
    const tiers =
        sponsors?.properties?.tiers?.items
            .map((item) => item.content)
            .filter((content) => content.contentType === 'sponsorTier') ?? [];

    return (
        <section id="sponsor">
            <SectionTitleBar title="Sponsors" />

            <div className="py-12 sm:py-20">
                <div className="content-container">
                    {tiers.map((tier) => (
                        <SponsorTierItem key={tier.id} tier={tier} />
                    ))}
                </div>

                <div className="content-container bg-black relative overflow-clip">
                    <div className="bg-primary w-0 sm:w-1/4 lg:w-1/3 h-full absolute right-0 top-0 bottom-0"></div>
                    <div className="bg-primary w-[200%] sm:w-full h-[200%] absolute right-0 sm:right-1/4 lg:right-1/3 top-0 bottom-0 -rotate-45 origin-top-right"></div>
                    <div className="flex flex-col xl:flex-row justify-center relative py-20 px-10 xl:space-x-8 items-center space-y-4 xl:space-y-0">
                        <Image src={logo} alt="Method Logo" />

                        <p className="text-white font-bold text-2xl text-center">
                            Interested in becoming a sponsor?
                        </p>

                        <a
                            target="_blank"
                            href="/2024-Method-Conference-Sponsorship-Packet.pdf"
                            className="button inline-block"
                        >
                            See Opportunities
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
