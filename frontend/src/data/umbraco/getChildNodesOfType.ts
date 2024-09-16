import type { ContentTypeKeys, ContentTypes } from '@/data/umbraco/types';
import { getItemsOrDefault } from '@/data/umbraco/getItems';

export type GetChildNodesOfTypeArgs<T> = {
    nodeId: string;
    type: T;
    take?: number;
};

export async function getChildNodesOfType<T extends ContentTypeKeys>({
    nodeId,
    type,
    take = 10,
}: GetChildNodesOfTypeArgs<T>): Promise<
    Extract<ContentTypes, { contentType: T }>[]
> {
    const { items } = await getItemsOrDefault({
        filter: [`contentType:${type}`],
        fetch: `descendants:${nodeId}`,
        take,
    });

    return items.filter(
        (item): item is Extract<ContentTypes, { contentType: T }> =>
            item.contentType === type,
    );
}

export type GetFirstChildNodeOfTypeArgs<T> = {
    nodeId: string;
    type: T;
};

export async function getFirstChildNodeOfType<T extends ContentTypeKeys>({
    nodeId,
    type,
}: GetFirstChildNodeOfTypeArgs<T>): Promise<
    Extract<ContentTypes, { contentType: T }> | undefined
> {
    const childNodes = await getChildNodesOfType<T>({ nodeId, type, take: 1 });

    return childNodes[0];
}
