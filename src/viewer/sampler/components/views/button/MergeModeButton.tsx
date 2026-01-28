import { Dispatch, SetStateAction } from 'react';
import { useLanguage } from '../../../../../i18n';
import Button from './Button';

export interface MergeModeButtonProps {
    merged: boolean;
    setMerged: Dispatch<SetStateAction<boolean>>;
}

export default function MergeModeButton({
    merged,
    setMerged,
}: MergeModeButtonProps) {
    const { t } = useLanguage();
    return (
        <Button
            value={merged}
            setValue={setMerged}
            title={t('viewer.sampler.buttons.mergeMode')}
            labelTrue={t('viewer.sampler.buttons.merge')}
            labelFalse={t('viewer.sampler.buttons.separate')}
            descriptionTrue={t('viewer.sampler.buttons.mergeDescription')}
            descriptionFalse={t('viewer.sampler.buttons.separateDescription')}
        />
    );
}
