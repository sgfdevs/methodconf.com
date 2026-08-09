import type { RichTextBlock } from '@/data/types';
import { RichText } from '@/components/RichText';

export interface RichTextBlockProps {
    block: RichTextBlock;
}

export function RichTextBlock({ block }: RichTextBlockProps) {
    const { markup } = block.properties?.text ?? {};

    return (
        <section className="my-12 sm:my-20">
            <div className="small-content-container">
                {markup ? <RichText markup={markup} /> : null}
            </div>
        </section>
    );
}
