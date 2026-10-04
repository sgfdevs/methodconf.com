export function _throw(msg: string): never {
    throw new Error(msg);
}

export function parseUrl(urlStr?: string | null): URL | undefined {
    if (!urlStr) {
        return;
    }

    try {
        return new URL(urlStr);
    } catch {
        return;
    }
}

export function splitBy<ItemType, ValidItemType extends ItemType>(
    items: ItemType[],
    isValid: (item: ItemType) => item is ValidItemType,
): [ValidItemType[], Exclude<ItemType, ValidItemType>[]];
export function splitBy<ItemType>(
    items: ItemType[],
    isValid: (item: ItemType) => boolean,
): [ItemType[], ItemType[]];
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

export type Overwrite<T, U> = Omit<T, keyof U> & U;
