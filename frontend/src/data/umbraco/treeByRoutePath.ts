import { splitBy, splitByTyped } from '@/util';

type Nested<T> = T & { children: Nested<T>[] };

const originalOrder = Symbol();

type WithOriginalOrder<T> = T & { [originalOrder]?: number };

export function treeByRoutePath<T extends { route: { path: string } }>(
    items: T[],
): Nested<T>[] {
    const itemsWithOriginalOrder = items.map((item, index) => {
        const updatedItem = item as WithOriginalOrder<T>;
        updatedItem[originalOrder] = index;
        return updatedItem;
    });

    const sortedItems = itemsWithOriginalOrder.sort(
        (a, b) => a.route.path.length - b.route.path.length,
    );

    const tree = treeByRoutePathSorted(sortedItems);

    reSortAndRemoveOriginalOrder(tree);

    return tree;
}

function treeByRoutePathSorted<T extends { route: { path: string } }>(
    items: T[],
): Nested<T>[] {
    const [shortestItem, ...otherItems] = items;

    if (!shortestItem) {
        return [];
    }

    const [matchingItems, nonMatchingItems] = splitBy(otherItems, (item) =>
        item.route.path.startsWith(shortestItem.route.path),
    );

    const itemWithChildren = shortestItem as Nested<T>;
    itemWithChildren.children = treeByRoutePathSorted(matchingItems);

    return [itemWithChildren, ...treeByRoutePathSorted(nonMatchingItems)];
}

function reSortAndRemoveOriginalOrder<T>(
    items: Nested<WithOriginalOrder<T>>[],
): void {
    if (items.length <= 0) {
        return;
    }

    items.sort((a, b) => (a[originalOrder] ?? 0) - (b[originalOrder] ?? 0));

    for (const item of items) {
        delete item[originalOrder];
        reSortAndRemoveOriginalOrder(item.children);
    }
}
