<script lang="ts">
    import { onMount } from 'svelte';
    import { getMobileAppStoreRedirect } from '#lib/mobileApp.ts';

    onMount(() => {
        const browserWindow = globalThis as typeof globalThis & {
            MSStream?: unknown;
        };
        const userAgent = globalThis.navigator.userAgent;
        const isTouchMac =
            /Macintosh/.test(userAgent) && 'ontouchend' in globalThis.document;
        const hasMicrosoftStream = Boolean(browserWindow.MSStream);
        const appStoreUrl = getMobileAppStoreRedirect(
            userAgent,
            isTouchMac,
            hasMicrosoftStream,
        );

        if (appStoreUrl) {
            globalThis.location.href = appStoreUrl;
        } else {
            globalThis.location.replace('/');
        }
    });
</script>

<div class="content-container">
    <p>
        If you are not automatically redirected click <a href="/">here</a>
    </p>
</div>
