import { CST_TZ } from '@/config';
import { TZDate } from '@date-fns/tz';

// Umbraco doesn't save dates with timezone information so we have to manually fix it
export function parseUtcAsCst(dateStr: string): TZDate {
    const dateStrWithoutZ = dateStr.replace(/Z$/, '');

    return new TZDate(dateStrWithoutZ, CST_TZ);
}
