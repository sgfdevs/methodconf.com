import Link from 'next/link';
import type { CmsLink } from '@/data/types';

export type ButtonProps = UrlButtonProps | CmsButtonProps;

const buttonClasses = 'button block';

export function Button({ className, children, ...props }: ButtonProps) {
    if ('cmsLink' in props) {
        return (
            <CmsButton className={className} cmsLink={props.cmsLink}>
                {children}
            </CmsButton>
        );
    }

    return (
        <UrlButton className={className} url={props.url}>
            {children}
        </UrlButton>
    );
}

export interface CmsButtonProps {
    cmsLink: CmsLink;
    children?: string | null;
    className?: string;
}

export function CmsButton({ cmsLink, children, className }: CmsButtonProps) {
    className = `${buttonClasses}${className ? className : ''}`;

    const { route, url, queryString, title } = cmsLink;

    const target = cmsLink.target ? cmsLink.target : undefined;

    if (cmsLink.linkType === 'Content' && route?.path) {
        const path = queryString ? route.path + queryString : route.path;

        return (
            <Link
                className={className}
                href={path}
                target={target}
                scroll={queryString?.startsWith('#') ?? false}
            >
                {children ?? title}
            </Link>
        );
    }

    if (cmsLink.linkType === 'External' && url) {
        const combinedUrl = queryString ? url + queryString : url;

        return (
            <a className={className} href={combinedUrl} target={target}>
                {children ?? title}
            </a>
        );
    }

    return <button className={className}>{children ?? title}</button>;
}

export interface UrlButtonProps {
    url: string;
    children?: string | null;
    className?: string;
}

export function UrlButton({ className, url, children }: UrlButtonProps) {
    className = `${buttonClasses}${className ? className : ''}`;

    if (!url) {
        return <button className={className}>{children}</button>;
    }

    const isExternalUrl =
        url.startsWith('https://') || url.startsWith('http://');

    if (isExternalUrl) {
        return (
            <a className={className} href={url} target="_blank">
                {children}
            </a>
        );
    }

    return (
        <Link className={className} href={url} scroll={url.startsWith('#')}>
            {children}
        </Link>
    );
}
