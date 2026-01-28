import { Dispatch, SetStateAction } from 'react';
import { useLanguage } from '../../../../../i18n';
import Button from './Button';

export interface BottomUpButtonProps {
    bottomUp: boolean;
    setBottomUp: Dispatch<SetStateAction<boolean>>;
}

export default function BottomUpButton({
    bottomUp,
    setBottomUp,
}: BottomUpButtonProps) {
    const { t } = useLanguage();
    return (
        <Button
            value={bottomUp}
            setValue={setBottomUp}
            title={t('viewer.sampler.buttons.display')}
            labelTrue={t('viewer.sampler.displayMode.bottomUp')}
            labelFalse={t('viewer.sampler.displayMode.topDown')}
            descriptionTrue={t('viewer.sampler.displayMode.bottomUpDescription')}
            descriptionFalse={t('viewer.sampler.displayMode.topDownDescription')}
        />
    );
}
