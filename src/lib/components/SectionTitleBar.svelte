<script lang="ts">
    interface Props {
        title: string;
    }

    let { title }: Props = $props();
</script>

<div class="bg-black pt-14">
    <div class="content-container">
        <hr class="hidden md:block border-b-4 border-primary mb-7 w-40" />
        <h2
            class="bg-white text-black inline-block md:text-4xl font-bold p-3 md:p-4 border-t-4 border-primary md:border-t-0"
        >
            {title}
        </h2>
    </div>
</div>
