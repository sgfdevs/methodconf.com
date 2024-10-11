import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { APPLE_APP_STORE_LINK, GOOGLE_PLAY_STORE_LINK } from '@/config';
import { ClientMobileAppRedirect } from '@/components/ClientMobileAppRedirect';

export default function MobileApp() {
    const headersList = headers();
    const userAgent = headersList.get('user-agent');

    if (!userAgent) {
        return redirect('/');
    }

    if (/android/i.test(userAgent)) {
        return redirect(GOOGLE_PLAY_STORE_LINK);
    }

    if (/iPhone|iPad|iPod/i.test(userAgent)) {
        return redirect(APPLE_APP_STORE_LINK);
    }

    return <ClientMobileAppRedirect />;
}
