import { SEARCH_INDEXING_ENABLED } from '$app/env/private';

export const load = () => ({
    searchIndexingEnabled: SEARCH_INDEXING_ENABLED,
});
