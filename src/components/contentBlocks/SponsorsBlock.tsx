import { SectionTitleBar } from '@/components/SectionTitleBar';
import Image from 'next/image';
import type { Sponsors } from '@/data/types';
import logo from '../../../public/method-logo.svg';
import { SponsorTierItem } from '@/components/SponsorTierItem';
import { Button } from '@/components/Button';

export interface SponsorBlockProps {
    sponsors?: Sponsors;
}

export function SponsorsBlock({ sponsors }: SponsorBlockProps) {
    const tiers =
        sponsors?.properties?.tiers?.items
            .map((item) => item.content)
            .filter((content) => content.contentType === 'sponsorTier') ?? [];

    const opportunitiesUrl = sponsors?.properties?.opportunitiesUrl?.[0];

    return (
        <section id="sponsor" className="mb-12 sm:mb-20">
            <SectionTitleBar title="Sponsors" />

            <div className="pt-12 sm:pt-20">
                {tiers.length > 0 ? (
                    <div className="content-container mb-12 sm:mb-14">
                        <p className="text-xl xl:text-4xl font-thin mb-8 text-center">
                            Method Conference 2024 is proud to be sponsored by
                        </p>
                        {tiers.map((tier) => (
                            <SponsorTierItem key={tier.id} tier={tier} />
                        ))}
                    </div>
                ) : null}

                {opportunitiesUrl ? (
                    <div className="content-container bg-black relative overflow-clip">
                        <div className="bg-primary w-0 sm:w-1/4 lg:w-1/3 h-full absolute right-0 top-0 bottom-0"></div>
                        <div className="bg-primary w-[200%] sm:w-full h-[200%] absolute right-0 sm:right-1/4 lg:right-1/3 top-0 bottom-0 -rotate-45 origin-top-right"></div>
                        <div className="flex flex-col xl:flex-row justify-center relative py-20 px-10 xl:space-x-8 items-center space-y-4 xl:space-y-0">
                            <Image src={logo} alt="Method Logo" />

                            <p className="text-white font-bold text-2xl text-center">
                                Interested in becoming a sponsor?
                            </p>
                            <Button
                                className="inline-block"
                                cmsLink={opportunitiesUrl}
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        </section>
    );
}
