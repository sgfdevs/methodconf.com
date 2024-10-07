import { CST_TZ } from '@/config';
import { TZDate } from '@date-fns/tz';

// Umbraco doesn't save dates with timezone information so we have to manually fix it
export function parseUtcAsCst(dateStr: string): Date {
    const date = new Date(dateStr);

    return new TZDate(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
        CST_TZ,
    );
}
