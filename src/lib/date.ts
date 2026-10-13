import { TZDate, tz } from '@date-fns/tz';
import { format } from 'date-fns';
import { CST_TZ } from '#lib/config.ts';

// Umbraco stores Chicago-local date parts without reliable zone data. Interpret
// the parts in America/Chicago, then return a plain Date instant so SvelteKit can
// serialize load data without custom transport hooks.
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

    const parsed = new TZDate(
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond,
        CST_TZ,
    );

    return new Date(parsed.getTime());
}

export function formatDate(date: Date | string, formatStr: string): string {
    return format(date, formatStr, { in: tz(CST_TZ) });
}
