<script lang="ts">
    import SectionTitleBar from '#lib/components/SectionTitleBar.svelte';
    import ScheduleGrid from '#lib/components/ScheduleGrid.svelte';
    import {
        flattenAndSortSessions,
        getScheduleTracks,
    } from '#lib/components/schedule.ts';
    import { formatDate } from '#lib/date.ts';
    import type { ParsedConference, Schedule } from '#lib/types.ts';

    interface Props {
        conference: ParsedConference;
        schedule?: Schedule;
    }

    let { conference, schedule }: Props = $props();

    const date = $derived(conference.properties?.date);
    const tracks = $derived(getScheduleTracks(schedule?.items));
    const sessions = $derived(flattenAndSortSessions(schedule?.items));
    const grid = $derived(schedule?.grid ?? []);
</script>

<section id="schedule" class="mb-12 sm:mb-20">
    <SectionTitleBar title="Schedule" />
    <div class="large-content-container">
        <div class="pt-12 sm:pt-20">
            {#if date}
                <h3 class="text-xl xl:text-4xl font-thin mb-8">
                    {formatDate(date, 'EEEE, MMMM do, yyyy')}
                </h3>
            {/if}

            <ScheduleGrid {grid} {tracks} {sessions} />
        </div>
    </div>
</section>
