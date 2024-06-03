import Link from 'next/link';

export interface INavigationProps {
    links: INavLinkProps[];
}

export function Navigation({ links }: INavigationProps) {
    return (
        <nav className="w-full bg-primary">
            <div className="content-container flex justify-end">
                <ul className="flex space-x-5 translate-y-1/2">
                    {links.map((link) => (
                        <li key={link.url}>
                            <NavLink {...link} />
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

export interface INavLinkProps {
    url: string;
    title: string;
}

export function NavLink({ url, title }: INavLinkProps) {
    const isExternalUrl =
        url.startsWith('https://') || url.startsWith('http://');

    const classes = 'button block';

    if (isExternalUrl) {
        return (
            <a className={classes} href={url} target="_blank">
                {title}
            </a>
        );
    }

    return (
        <Link className={classes} href={url}>
            {title}
        </Link>
    );
}
