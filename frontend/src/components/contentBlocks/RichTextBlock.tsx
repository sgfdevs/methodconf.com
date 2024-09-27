import type { RichTextBlock } from '@/data/types';
import { RichText } from '@/components/RichText';

export interface RichTextBlockProps {
    block: RichTextBlock;
}

export function RichTextBlock({ block }: RichTextBlockProps) {
    const { markup } = block.properties?.text ?? {};

    return (
        <section>
            {markup ? (
                <div className="small-content-container py-12 sm:py-20">
                    <RichText markup={markup} />
                </div>
            ) : null}
        </section>
    );
}
