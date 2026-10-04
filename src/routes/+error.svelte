<script lang="ts">
    import { page } from '$app/state';
</script>

<svelte:head>
    {#if page.status === 404}
        <title>404: This page could not be found.</title>
    {:else}
        <title
            >{page.status}: {page.error?.message ?? 'Application error'}</title
        >
    {/if}
    <meta name="robots" content="noindex" />
    <meta property="og:image" content="/opengraph-image.jpg" />
</svelte:head>

<div class="next-error-shell">
    <div class="next-error-content">
        <h1>{page.status}</h1>
        <div>
            {#if page.status === 404}
                <h2>This page could not be found.</h2>
            {:else}
                <h2>{page.error?.message ?? 'Application error'}</h2>
            {/if}
        </div>
    </div>
</div>

<style>
    :global(body) {
        background: #fff;
        color: #000;
    }

    .next-error-shell {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Source Sans 3', 'Source Sans 3 Fallback';
    }

    .next-error-content {
        display: flex;
        align-items: center;
    }

    h1 {
        display: inline-block;
        margin: 0 20px 0 0;
        padding-right: 23px;
        font-size: 24px;
        font-weight: 500;
        line-height: 49px;
        vertical-align: top;
        border-right: 1px solid rgb(0 0 0 / 30%);
    }

    h2 {
        font-size: 14px;
        font-weight: 400;
        line-height: 49px;
        margin: 0;
    }
</style>
