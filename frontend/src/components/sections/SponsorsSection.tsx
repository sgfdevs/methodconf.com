import { SectionTitleBar } from '@/components/SectionTitleBar';
import Image from 'next/image';
import logo from '../../../public/method-logo.svg';

export function SponsorsSection() {
    return (
        <section>
            <SectionTitleBar title="Sponsors" />

            <div className="py-20">
                <div className="content-container bg-black relative overflow-clip">
                    <div className="bg-primary w-0 sm:w-1/4 lg:w-1/3 h-full absolute right-0 top-0 bottom-0"></div>
                    <div className="bg-primary w-[200%] sm:w-full h-[200%] absolute right-0 sm:right-1/4 lg:right-1/3 top-0 bottom-0 -rotate-45 origin-top-right"></div>
                    <div className="flex flex-col xl:flex-row justify-center relative py-20 px-10 xl:space-x-8 items-center space-y-4 xl:space-y-0">
                        <Image src={logo} alt="Method Logo" />

                        <p className="text-white font-bold text-2xl">
                            Interested in becoming a sponsor?
                        </p>

                        <a href="#" className="button inline-block">
                            See Opportunities
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
