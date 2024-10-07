import { format } from 'date-fns';
import { tz } from '@date-fns/tz';
import { CST_TZ } from '@/config';

export function _throw(msg: string): never {
    throw msg;
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

// Dates are actually strings when running on the client
// hence the Date | string type
export function formatDate(date: Date | string, formatStr: string): string {
    return format(date, formatStr, { in: tz(CST_TZ) });
}

export type Overwrite<T, U> = Omit<T, keyof U> & U;
