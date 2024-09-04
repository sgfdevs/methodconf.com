import { partition } from '@/util';

type Nested<T> = T & { children: Nested<T>[] };

export function treeByRoutePath<T extends { route: { path: string } }>(
    items: T[],
): Nested<T>[] {
    if (items.length <= 0) {
        return [];
    }

    const sortedItems = [...items].sort(
        (a, b) => a.route.path.length - b.route.path.length,
    );

    return treeByRoutePathSorted(sortedItems);
}

function treeByRoutePathSorted<T extends { route: { path: string } }>(
    items: T[],
): Nested<T>[] {
    const [shortestItem, ...otherItems] = items;

    if (!shortestItem) {
        return [];
    }

    const [matchingItems, nonMatchingItems] = partition(otherItems, (item) =>
        item.route.path.startsWith(shortestItem.route.path),
    );

    return [
        {
            ...shortestItem,
            children: treeByRoutePathSorted(matchingItems),
        },
        ...treeByRoutePathSorted(nonMatchingItems),
    ];
}
