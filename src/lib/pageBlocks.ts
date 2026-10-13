import type { ContentBlock } from '#lib/types.ts';

export function getPageBlocks(page: {
    properties?: {
        blocks?: { items?: { content?: ContentBlock }[] } | null;
    } | null;
}): ContentBlock[] {
    return (
        page.properties?.blocks?.items?.flatMap((item) =>
            item.content ? [item.content] : [],
        ) ?? []
    );
}
