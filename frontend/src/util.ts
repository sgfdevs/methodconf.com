export function _throw(msg: string): never {
    throw msg;
}

export function parseUrl(urlStr?: string | null): URL | undefined {
    if (!urlStr) {
        return;
    }

    try {
        return new URL(urlStr);
    } catch (e) {
        return;
    }
}

export function splitByTyped<ItemType, ValidItemType extends ItemType>(
    items: ItemType[],
    isValid: (item: ItemType) => item is ValidItemType,
): [ValidItemType[], Exclude<ItemType, ValidItemType>[]] {
    const validItems: ValidItemType[] = [];
    const invalidItems: Exclude<ItemType, ValidItemType>[] = [];

    for (const item of items) {
        if (isValid(item)) {
            validItems.push(item);
        } else {
            invalidItems.push(item as Exclude<ItemType, ValidItemType>);
        }
    }

    return [validItems, invalidItems];
}

export function splitBy<ItemType>(
    items: ItemType[],
    isValid: (item: ItemType) => boolean,
): [ItemType[], ItemType[]] {
    const validItems: ItemType[] = [];
    const invalidItems: ItemType[] = [];

    for (const item of items) {
        if (isValid(item)) {
            validItems.push(item);
        } else {
            invalidItems.push(item);
        }
    }

    return [validItems, invalidItems];
}

export type MappedOmit<T, K extends keyof T> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};
