import { faCogs } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch, ReactNode, SetStateAction } from 'react';

export interface ButtonProps {
    value: boolean;
    setValue: Dispatch<SetStateAction<boolean>>;
    title: string;
    labelTrue: string;
    labelFalse: string;
    descriptionTrue?: string;
    descriptionFalse?: string;
}

export default function Button({
    value,
    setValue,
    title,
    labelTrue,
    labelFalse,
    descriptionTrue,
    descriptionFalse,
}: ButtonProps) {
    function onClick() {
        setValue(!value);
    }

    const description = value ? descriptionTrue : descriptionFalse;

    return (
        <div className="button">
            <button onClick={onClick} title={description}>
                <FontAwesomeIcon icon={faCogs} /> <span>{title}:</span>{' '}
                {value ? labelTrue : labelFalse}
            </button>
        </div>
    );
}
