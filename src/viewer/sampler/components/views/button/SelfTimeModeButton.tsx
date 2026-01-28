import { Dispatch, SetStateAction, useContext } from 'react';
import { SamplerMetadata_SamplerMode } from '../../../../proto/spark_pb';
import { useLanguage } from '../../../../../i18n';
import { MetadataContext } from '../../SamplerContext';
import Button from './Button';

export interface SelfTimeModeButtonProps {
    selfTimeMode: boolean;
    setSelfTimeMode: Dispatch<SetStateAction<boolean>>;
}

export default function SelfTimeModeButton({
    selfTimeMode,
    setSelfTimeMode,
}: SelfTimeModeButtonProps) {
    const { t } = useLanguage();
    const metadata = useContext(MetadataContext)!;

    if (metadata.samplerMode === SamplerMetadata_SamplerMode.ALLOCATION) {
        return (
            <Button
                value={selfTimeMode}
                setValue={setSelfTimeMode}
                title={t('viewer.sampler.buttons.sortMode')}
                labelTrue={t('viewer.sampler.buttons.selfBytesAllocated')}
                labelFalse={t('viewer.sampler.buttons.totalBytesAllocated')}
                descriptionTrue={t('viewer.sampler.buttons.selfBytesDescription')}
                descriptionFalse={t('viewer.sampler.buttons.totalBytesDescription')}
            />
        );
    } else {
        return (
            <Button
                value={selfTimeMode}
                setValue={setSelfTimeMode}
                title={t('viewer.sampler.buttons.sortMode')}
                labelTrue={t('viewer.sampler.sortMode.selfTime')}
                labelFalse={t('viewer.sampler.sortMode.totalTime')}
                descriptionTrue={t('viewer.sampler.sortMode.selfTimeDescription')}
                descriptionFalse={t('viewer.sampler.sortMode.totalTimeDescription')}
            />
        );
    }
}
