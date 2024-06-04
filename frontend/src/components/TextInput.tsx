import { useId } from 'react';

export interface ITextInputProps {
    label: string;
    name: string;
    className?: string;
    value?: string;
    onChange: (value: string) => void;
    required?: boolean;
    type?: 'text' | 'email';
}

export function TextInput({
    label,
    name,
    className = '',
    value,
    onChange,
    required = false,
    type = 'text',
}: ITextInputProps) {
    const id = useId();

    return (
        <div className={`relative ${className}`}>
            <div className="absolute h-1/2 bottom-0 left-0 right-0 bg-black -z-10"></div>
            <div className="p-0.5 pt-0">
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={(evt) => onChange(evt.target.value)}
                    className="block px-2.5 pb-2.5 pt-5 w-full text-sm text-gray-900 bg-gray-100 appearance-none focus:outline-none focus:ring-0 peer"
                    placeholder=" "
                    name={name}
                    required={required}
                />
                <label
                    htmlFor={id}
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-2.5 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
                >
                    {label}
                </label>
            </div>
        </div>
    );
}
