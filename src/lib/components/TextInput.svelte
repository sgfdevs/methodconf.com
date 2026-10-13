<script lang="ts">
    interface Props {
        label: string;
        name: string;
        class?: string;
        value?: string;
        required?: boolean;
        type?: 'text' | 'email';
    }

    let {
        label,
        name,
        class: className = '',
        value = $bindable(''),
        required = false,
        type = 'text',
    }: Props = $props();

    const id = $props.id();
</script>

<div class={`text-input-root ${className}`.trimEnd()}>
    <div class="text-input-backdrop"></div>
    <div class="text-input-field p-0.5 pt-0">
        <input
            {type}
            {id}
            bind:value
            class="block px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-100 appearance-none focus:outline-hidden focus:ring-0 peer"
            placeholder=" "
            {name}
            {required}
        />
        <label
            for={id}
            class="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
        >
            {label}
        </label>
    </div>
</div>
