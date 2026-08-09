export interface ISectionTitleBarProps {
    title: string;
}

export function SectionTitleBar({ title }: ISectionTitleBarProps) {
    return (
        <div className="bg-black pt-14">
            <div className="content-container">
                <hr className="hidden md:block border-b-4 border-primary mb-7 w-40" />
                <h2 className="bg-white text-black inline-block md:text-4xl font-bold p-3 md:p-4 border-t-4 border-primary md:border-t-0">
                    {title}
                </h2>
            </div>
        </div>
    );
}
