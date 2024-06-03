import { SectionTitleBar } from '@/components/SectionTitleBar';
import Image from 'next/image';
import logo from '../../../public/method-logo.svg';

export function SponsorsSection() {
    return (
        <section>
            <SectionTitleBar title="Sponsors" />

            <div className="py-20">
                <div className="content-container bg-black">
                    <Image
                        className="max-w-full mx-auto"
                        src={logo}
                        alt="Method Logo"
                    />
                </div>
            </div>
        </section>
    );
}
