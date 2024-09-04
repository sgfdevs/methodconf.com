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

export function splitBy<ItemType, ValidItemType extends ItemType>(
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
