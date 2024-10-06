import { parse } from 'date-fns';
import { CST_TZ } from '@/config';
import { TZDate } from '@date-fns/tz';

// Umbraco doesn't save dates with timezone information so we have to manually fix it
export function parseUtcAsCst(dateStr: string): Date {
    const utcDate = parse(dateStr, "yyyy-MM-dd'T'HH:mm:ss'Z'", new Date());

    return new TZDate(utcDate, CST_TZ);
}
