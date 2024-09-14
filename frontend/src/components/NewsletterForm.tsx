'use client';

import { TextInput } from '@/components/TextInput';
import type { FormEvent } from 'react';
import { useId, useState } from 'react';
import Swal from 'sweetalert2';

export function NewsletterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [nullCheck, setNullCheck] = useState('');
    const id = useId();

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        let success = false;

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, nullCheck }),
            }).then((res) => res.json());

            success = res['success'];
        } catch (err) {}

        if (!success) {
            await Swal.fire({
                text: `Something went wrong!`,
                icon: 'error',
            });

            return;
        }

        await Swal.fire({
            title: 'Check your email',
            text: `You\'ll be sent an email to confirm your subscriptions to our newsletter`,
            icon: 'success',
        });

        // setName('');
        // setEmail('');
        // setNullCheck('');
    }

    return (
        <form action="" onSubmit={onSubmit}>
            <TextInput
                className="mb-4"
                label="Name"
                name="name"
                value={name}
                onChange={setName}
            />
            <TextInput
                className="mb-4"
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                required={true}
            />
            <label htmlFor={id} className="sr-only">
                Leave this field empty
            </label>
            <input
                type="text"
                id={id}
                name="company"
                className="sr-only"
                tabIndex={-1}
                autoComplete="off"
                value={nullCheck}
                onChange={(evt) => setNullCheck(evt.target.value)}
            />
            <button className="button" type="submit">
                Email Signup
            </button>
        </form>
    );
}
