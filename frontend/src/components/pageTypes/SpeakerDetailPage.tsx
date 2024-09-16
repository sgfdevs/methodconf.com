import type { ParsedConference, Speaker } from '@/data/types';
import { getSessionsForSpeaker } from '@/data/getSessionsForSpeaker';

export interface SpeakerDetailPageProps {
    conference: ParsedConference;
    speaker: Speaker;
}

export async function SpeakerDetailPage({
    conference,
    speaker,
}: SpeakerDetailPageProps) {
    const sessions = await getSessionsForSpeaker(conference.id, speaker.id);

    return (
        <div>
            {speaker.name}
            <br />
            <ul>
                {sessions.map((s) => (
                    <li key={s.id}>{s.name}</li>
                ))}
            </ul>
        </div>
    );
}
