<script lang="ts">
    import TextInput from '#lib/components/TextInput.svelte';
    import Swal from 'sweetalert2';

    let name = $state('');
    let email = $state('');
    let nullCheck = $state('');
    let pending = $state(false);

    const id = $props.id();

    async function onSubmit(event: { preventDefault: () => void }) {
        event.preventDefault();

        if (pending) {
            return;
        }

        pending = true;
        let success = false;

        try {
            const response = await globalThis.fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, nullCheck }),
            });
            const result = await response.json();

            success = result.success === true;
        } catch {
            // Keep the default failure state.
        } finally {
            pending = false;
        }

        if (!success) {
            await Swal.fire({
                text: 'Something went wrong!',
                icon: 'error',
            });

            return;
        }

        await Swal.fire({
            title: 'Check your email',
            text: "You'll be sent an email to confirm your subscriptions to our newsletter",
            icon: 'success',
        });
    }
</script>

<form action="" onsubmit={onSubmit}>
    <TextInput class="mb-4" label="Name" name="name" bind:value={name} />
    <TextInput
        class="mb-4"
        label="Email"
        name="email"
        type="email"
        bind:value={email}
        required
    />
    <label for={id} class="sr-only">Leave this field empty</label>
    <input
        type="text"
        {id}
        name="company"
        class="sr-only"
        tabindex="-1"
        autocomplete="off"
        bind:value={nullCheck}
    />
    <button class="button" type="submit">Email Signup</button>
</form>
