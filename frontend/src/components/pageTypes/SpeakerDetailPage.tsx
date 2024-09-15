import type { ParsedConference, Speaker } from '@/data/types';

export interface SpeakerDetailPageProps {
    conference: ParsedConference;
    speaker: Speaker;
}

export function SpeakerDetailPage({ speaker }: SpeakerDetailPageProps) {
    return <div>{speaker.name}</div>;
}
