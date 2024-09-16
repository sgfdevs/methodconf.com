import type { ButtonHTMLAttributes, ReactNode } from 'react';
import {
    useAccordionItem,
    useAccordionItemEffect,
    useHeightTransition,
} from '@szhsin/react-accordion';

export interface HeaderRenderProps {
    buttonProps: ButtonHTMLAttributes<Element>;
    state: ReturnType<typeof useAccordionItemEffect>['state'];
}

export interface CustomAccordionItemProps {
    header: (props: HeaderRenderProps) => ReactNode;
    children: ReactNode;
    itemKey?: string | number;
    initialEntered?: boolean;
    disabled?: boolean;
}

export function CustomAccordionItem({
    header,
    children,
    itemKey,
    initialEntered,
    disabled,
}: CustomAccordionItemProps) {
    const { itemRef, state, toggle } = useAccordionItemEffect<HTMLDivElement>({
        itemKey,
        initialEntered,
        disabled,
    });
    const { buttonProps, panelProps } = useAccordionItem({
        state,
        toggle,
        disabled,
    });

    const [transitionStyle, panelRef] =
        useHeightTransition<HTMLDivElement>(state);

    const { status, isMounted } = state;

    return (
        <div ref={itemRef}>
            {header({ state, buttonProps })}
            {isMounted && (
                // Add an extra `div` around the panel `div` for the
                // height transition to work as intended
                <div
                    className="transition-[height] duration-300 ease-[cubic-bezier(0,0,0,1)]"
                    style={{
                        display: status === 'exited' ? 'none' : undefined,
                        ...transitionStyle,
                    }}
                >
                    <div ref={panelRef} {...panelProps}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
