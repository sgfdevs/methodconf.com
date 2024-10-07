import { parse } from 'date-fns';
import { TZDate } from '@date-fns/tz';
import { CST_TZ } from '@/config';

// Umbraco doesn't save dates with timezone information so we have to manually fix it
export function parseUtcAsCst(dateStr: string): Date {
    const utcDate = parse(dateStr, "yyyy-MM-dd'T'HH:mm:ss'Z'", new Date());

    return new TZDate(
        utcDate.getFullYear(),
        utcDate.getMonth(),
        utcDate.getDate(),
        utcDate.getHours(),
        utcDate.getMinutes(),
        utcDate.getSeconds(),
        utcDate.getMilliseconds(),
        CST_TZ,
    );
}
