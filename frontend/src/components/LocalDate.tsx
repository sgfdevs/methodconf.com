'use client';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

export interface LocalDateProps {
    date: Date;
    format: string;
}

export function LocalDate({ date, format: formatStr }: LocalDateProps) {
    const [formatted, setFormatted] = useState(format(date, formatStr));

    useEffect(() => {
        setFormatted(format(date, formatStr));
    }, [date, formatStr]);

    return <span suppressHydrationWarning={true}>{formatted}</span>;
}
