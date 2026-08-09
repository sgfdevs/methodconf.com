import { TZDate } from '@date-fns/tz';
import { CST_TZ } from '@/config';

// Umbraco doesn't save dates with timezone information so we have to manually fix it
export function parseUtcAsCst(dateStr: string): Date {
    const match = dateStr.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,7}))?)?)?(?:Z|[+-]\d{2}:\d{2})?$/,
    );

    if (!match) {
        return new Date(Number.NaN);
    }

    const [
        ,
        yearStr,
        monthStr,
        dayStr,
        hourStr,
        minuteStr,
        secondStr,
        millisecondStr,
    ] = match;

    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    const day = Number(dayStr);
    const hour = Number(hourStr ?? 0);
    const minute = Number(minuteStr ?? 0);
    const second = Number(secondStr ?? 0);
    const millisecond = Number(
        (millisecondStr ?? '0').slice(0, 3).padEnd(3, '0'),
    );

    return new TZDate(
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond,
        CST_TZ,
    );
}
