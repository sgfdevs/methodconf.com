import type { CardSize } from './SponsorCard.svelte';

export function parseCardSize(str: string | null = ''): CardSize | undefined {
    str = str?.toLowerCase() ?? '';

    switch (str) {
        case 'large':
        case 'medium':
        case 'small':
            return str;
    }
}
