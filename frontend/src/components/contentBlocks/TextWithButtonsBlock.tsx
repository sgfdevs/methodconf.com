import type { TextWithButtonsBlock } from '@/data/types';
import { RichText } from '@/components/RichText';
import { Button } from '@/components/Button';

export interface TextWithButtonsBlockProps {
    block: TextWithButtonsBlock;
}

export function TextWithButtonsBlock({ block }: TextWithButtonsBlockProps) {
    const text = block.properties?.text?.markup;
    const buttons = block.properties?.buttons ?? [];

    console.log(buttons);

    return (
        <section className="my-12 sm:my-20">
            <div className="small-content-container">
                {text ? <RichText className="mb-5" markup={text} /> : null}
                <div className="flex space-x-3">
                    {buttons.map((button, index) => (
                        <Button key={index} cmsLink={button}>
                            {button.title}
                        </Button>
                    ))}
                </div>
            </div>
        </section>
    );
}
