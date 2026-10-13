import { isSearchIndexingEnabled } from '#lib/server/config.ts';

export const load = () => ({
    searchIndexingEnabled: isSearchIndexingEnabled(),
});
