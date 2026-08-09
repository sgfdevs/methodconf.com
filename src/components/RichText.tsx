export interface RichTextProps {
    markup: string;
    className?: string;
}

export function RichText({ markup, className }: RichTextProps) {
    return (
        <div
            className={`prose prose-a:text-primary prose-a:decoration-0 prose-a:font-normal max-w-none ${className}`}
            dangerouslySetInnerHTML={{
                __html: markup,
            }}
        />
    );
}
