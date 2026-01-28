import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch, SetStateAction } from 'react';
import { useLanguage } from '../../../../../i18n';
import { SamplerMetadata } from '../../../../proto/spark_pb';
import { View, VIEW_ALL, VIEW_FLAT, VIEW_SOURCES } from '../types';

export interface ViewSwitcherProps {
    metadata: SamplerMetadata;
    view: View;
    setView: Dispatch<SetStateAction<View>>;
    sourcesViewSupported: boolean;
}

export default function ViewSwitcher({
    metadata,
    view,
    setView,
    sourcesViewSupported,
}: ViewSwitcherProps) {
    const { t } = useLanguage();
    const supportedViews: View[] = [
        VIEW_ALL,
        VIEW_FLAT,
        ...(sourcesViewSupported ? [VIEW_SOURCES] : []),
    ];

    return (
        <div className="view-switcher">
            {supportedViews.map(v => {
                let label;
                let description;
                if (v === VIEW_ALL) {
                    label = t('viewer.allView.title');
                    description = t('viewer.allView.description');
                } else if (v === VIEW_FLAT) {
                    label = t('viewer.flatView.title');
                    description = t('viewer.flatView.description');
                } else {
                    const isMod = ['Fabric', 'Forge', 'NeoForge'].includes(
                        metadata?.platform?.name || ''
                    );
                    label = isMod
                        ? t('viewer.sourcesView.modsTitle')
                        : t('viewer.sourcesView.pluginsTitle');
                    description = isMod
                        ? t('viewer.sourcesView.modsDescription')
                        : t('viewer.sourcesView.pluginsDescription');
                }

                const isActive = view === v;

                return (
                    <div className="button" key={v}>
                        <button
                            onClick={() => setView(v)}
                            title={description}
                            style={isActive ? {
                                borderColor: '#ffc93a',
                                background: '#38414a',
                                color: '#fff'
                            } : {}}
                        >
                            <FontAwesomeIcon icon={faEye} style={isActive ? { color: '#ffc93a' } : {}} />{' '}
                            <span style={isActive ? { color: '#ffc93a' } : {}}>{label}</span>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
