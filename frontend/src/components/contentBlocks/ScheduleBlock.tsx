import React from 'react';
import { SectionTitleBar } from '@/components/SectionTitleBar';
import type { ParsedSession, ParsedConference, Schedule } from '@/data/types';
import { formatDate } from '@/util';
import { ScheduleGrid } from '@/components/ScheduleGrid';

export interface ScheduleBlockProps {
    conference: ParsedConference;
    schedule?: Schedule;
}

export function ScheduleBlock({ conference, schedule }: ScheduleBlockProps) {
    const { date } = conference.properties;

    const tracks =
        schedule?.items.filter((item) => item.contentType === 'track') ?? [];

    const sessions =
        schedule?.items
            .flatMap((item) =>
                item.contentType === 'track' ? item.children : item,
            )
            .sort(sessionSort) ?? [];

    const grid = schedule?.grid ?? [];

    return (
        <section id="schedule" className="mb-12 sm:mb-20">
            <SectionTitleBar title="Schedule" />
            <div className="large-content-container">
                <div className="pt-12 sm:pt-20">
                    {date ? (
                        <h3 className="text-xl xl:text-4xl font-thin mb-8">
                            {formatDate(date, 'EEEE, MMMM do, yyyy')}
                        </h3>
                    ) : null}

                    <ScheduleGrid
                        grid={grid}
                        tracks={tracks}
                        sessions={sessions}
                    />
                </div>
            </div>
        </section>
    );
}

function sessionSort(a?: ParsedSession, b?: ParsedSession): number {
    return (
        (a?.properties?.start?.getTime() ?? 0) -
        (b?.properties?.start?.getTime() ?? 0)
    );
}
