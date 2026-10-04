import { buildSharedHead, type SharedHead } from '#lib/head.ts';
import { imageUrl } from '#lib/imageUrl.ts';
import type { Page, Speaker } from '#lib/types.ts';

const TITLE_TEMPLATE_PREFIX = 'Method Conference - ';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

export function buildGenericPageHead({
    page,
    siteUrl,
}: {
    page: Page;
    siteUrl: string;
}): SharedHead {
    const {
        title,
        metaDescription,
        openGraphImage: openGraphImages,
    } = page.properties ?? {};
    const [openGraphImage] = openGraphImages ?? [];

    return buildSharedHead({
        siteUrl,
        metadata: {
            title: title ? applyTitleTemplate(title) : undefined,
            description: metaDescription ?? undefined,
            openGraph: openGraphImage?.url
                ? {
                      image: {
                          url: imageUrl(openGraphImage.url, {
                              width: OG_IMAGE_WIDTH,
                              height: OG_IMAGE_HEIGHT,
                          }),
                          width: OG_IMAGE_WIDTH,
                          height: OG_IMAGE_HEIGHT,
                      },
                  }
                : undefined,
        },
    });
}

export function buildSpeakerHead({
    speaker,
    siteUrl,
}: {
    speaker: Speaker;
    siteUrl: string;
}): SharedHead {
    return buildSharedHead({
        siteUrl,
        metadata: {
            title: speaker.name ? applyTitleTemplate(speaker.name) : undefined,
        },
    });
}

function applyTitleTemplate(title: string): string {
    return `${TITLE_TEMPLATE_PREFIX}${title}`;
}
