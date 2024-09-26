import type { PageProps } from '@/app/[conference]/[...slug]/page';
import type { Page } from '@/data/types';
import type { Metadata } from 'next';
import { imageUrl } from '@/data/umbraco/imageUrl';

export interface GenericPageProps extends PageProps {
    page: Page;
}

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

export async function generateMetadata({
    page,
}: GenericPageProps): Promise<Metadata> {
    const {
        title,
        metaDescription,
        openGraphImage: openGraphImages,
    } = page.properties ?? {};
    const [openGraphImage] = openGraphImages ?? [];

    const metadata: Metadata = {};

    if (title) {
        metadata.title = title;
    }

    if (metaDescription) {
        metadata.description = metaDescription;
    }

    if (openGraphImage?.url) {
        const url = imageUrl(openGraphImage.url, {
            width: OG_IMAGE_WIDTH,
            height: OG_IMAGE_HEIGHT,
        });

        metadata.openGraph = {
            images: [
                {
                    url,
                    width: OG_IMAGE_WIDTH,
                    height: OG_IMAGE_HEIGHT,
                },
            ],
        };
    }

    return metadata;
}

export async function GenericPage({ page }: GenericPageProps) {
    return '';
}
