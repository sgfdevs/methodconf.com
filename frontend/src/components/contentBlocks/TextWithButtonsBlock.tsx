import type { TextWithButtonsBlock } from '@/data/types';
import { RichText } from '@/components/RichText';

export interface TextWithButtonsBlockProps {
    block: TextWithButtonsBlock;
}

export function TextWithButtonsBlock({ block }: TextWithButtonsBlockProps) {
    const { text, buttons } = block.properties ?? {};

    console.log(buttons);

    return (
        <section>
            <div className="small-content-container py-12 sm:py-20">
                {text?.markup ? <RichText markup={text.markup} /> : null}
            </div>
        </section>
    );
    return '';
}
