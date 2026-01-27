import { faEye } from '@fortawesome/free-solid-svg-icons';
import { Dispatch, SetStateAction } from 'react';
import { useLanguage } from '../../../../i18n';
import FaButton from '../../../../components/FaButton';
import { SamplerMetadata } from '../../../proto/spark_pb';
import { View, VIEW_ALL, VIEW_FLAT, VIEW_SOURCES } from '../views/types';

export interface ToggleViewButtonProps {
    metadata: SamplerMetadata;
    view: View;
    setView: Dispatch<SetStateAction<View>>;
    sourcesViewSupported: boolean;
}

export default function ToggleViewButton({
    metadata,
    view,
    setView,
    sourcesViewSupported,
}: ToggleViewButtonProps) {
    const { t } = useLanguage();
    const supportedViews: View[] = [
        VIEW_ALL,
        VIEW_FLAT,
        ...(sourcesViewSupported ? [VIEW_SOURCES] : []),
    ];

    return (
        <>
            {supportedViews.map(v => {
                function onClick() {
                    setView(v);
                }

                let label;
                if (v === VIEW_ALL) {
                    label = t('viewer.allView.title');
                } else if (v === VIEW_FLAT) {
                    label = t('viewer.flatView.title');
                } else {
                    label = ['Fabric', 'Forge', 'NeoForge'].includes(
                        metadata?.platform?.name || ''
                    )
                        ? t('viewer.sourcesView.modsTitle')
                        : t('viewer.sourcesView.pluginsTitle');
                }

                return (
                    <FaButton
                        key={label}
                        icon={faEye}
                        onClick={onClick}
                        title={t('viewer.controls.toggleView')}
                        extraClassName={
                            view === v
                                ? 'sources-view-button toggled'
                                : 'sources-view-button'
                        }
                    >
                            <span>{label}</span>
                    </FaButton>
                );
            })}
        </>
    );
}
