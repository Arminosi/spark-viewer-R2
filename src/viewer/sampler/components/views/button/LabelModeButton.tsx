import { Dispatch, SetStateAction, useContext } from 'react';
import { SamplerMetadata_SamplerMode } from '../../../../proto/spark_pb';
import { useLanguage } from '../../../../../i18n';
import { MetadataContext } from '../../SamplerContext';
import Button from './Button';

export interface LabelModeButtonProps {
    labelMode: boolean;
    setLabelMode: Dispatch<SetStateAction<boolean>>;
}

export default function LabelModeButton({
    labelMode,
    setLabelMode,
}: LabelModeButtonProps) {
    const { t } = useLanguage();
    const metadata = useContext(MetadataContext)!;
    if (!metadata.numberOfTicks) {
        return null;
    }

    if (metadata.samplerMode === SamplerMetadata_SamplerMode.ALLOCATION) {
        return (
            <Button
                value={labelMode}
                setValue={setLabelMode}
                title={t('viewer.sampler.buttons.label')}
                labelTrue={t('viewer.sampler.buttons.bytesPerSecond')}
                labelFalse={t('viewer.sampler.labelMode.percentage')}
            >
                <p>
                    {t('viewer.sampler.buttons.bytesPerSecondDescription')}
                </p>
                <p>
                    {t('viewer.sampler.buttons.percentageAllocationDescription')}
                </p>
            </Button>
        );
    } else {
        return (
            <Button
                value={labelMode}
                setValue={setLabelMode}
                title={t('viewer.sampler.buttons.label')}
                labelTrue={t('viewer.sampler.buttons.timePerTick')}
                labelFalse={t('viewer.sampler.labelMode.percentage')}
            >
                <p>
                    {t('viewer.sampler.buttons.timePerTickDescription')}
                </p>
                <p>
                    {t('viewer.sampler.labelMode.percentageDescription')}
                </p>
            </Button>
        );
    }
}
