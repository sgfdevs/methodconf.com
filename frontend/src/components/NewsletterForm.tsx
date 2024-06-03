import { TextInput } from '@/components/TextInput';

export function NewsletterForm() {
    async function subscribeToNewsletter(formData: FormData) {
        'use server';
    }

    return (
        <form action={subscribeToNewsletter}>
            <TextInput className="mb-4" label="Name" name="name" />
            <TextInput
                className="mb-4"
                label="Email"
                name="email"
                type="email"
            />
            <button className="button" type="submit">
                Email Signup
            </button>
        </form>
    );
}
