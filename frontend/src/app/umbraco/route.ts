import { redirect } from 'next/navigation';
import { NEXT_PUBLIC_UMBRACO_BASE_URL } from '@/config';

export function GET() {
    redirect(NEXT_PUBLIC_UMBRACO_BASE_URL.toString());
}
