import { SectionTitleBar } from '@/components/SectionTitleBar';
import { getConference } from '@/data/getConference';

export async function ScheduleSection() {
    await getConference();

    return (
        <section>
            <SectionTitleBar title="Schedule" />
        </section>
    );
}
