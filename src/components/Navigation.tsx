import { Button } from '@/components/Button';

export interface INavigationProps {
    links: { url: string; title: string }[];
}

export function Navigation({ links }: INavigationProps) {
    return (
        <nav className="w-full bg-primary">
            <div className="content-container flex justify-end">
                <ul className="flex space-x-5 translate-y-1/2">
                    {links.map(({ url, title }) => (
                        <li key={url}>
                            <Button url={url}>{title}</Button>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
