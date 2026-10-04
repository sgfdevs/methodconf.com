import type { SharedHead } from '#lib/head.ts';

declare global {
    namespace App {
        interface PageData {
            sharedHead?: SharedHead;
        }
    }
}

export {};
