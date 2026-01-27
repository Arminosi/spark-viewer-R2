import { useContext } from 'react';
import { useLanguage } from '../../../../../i18n';
import { MetadataContext } from '../../SamplerContext';
import { HeaderProps } from './types';

export default function SourcesViewHeader({ children }: HeaderProps) {
    const metadata = useContext(MetadataContext)!;
    const { t } = useLanguage();
    const isMod = ['Fabric', 'Forge', 'NeoForge'].includes(
        metadata.platform?.name!
    );
    const sourceNoun = isMod
        ? { singular: 'mod', plural: 'Mods' }
        : { singular: 'plugin', plural: 'Plugins' };

    return (
        <div className="header">
            <h2>{isMod ? t('viewer.sourcesView.modsTitle') : t('viewer.sourcesView.pluginsTitle')}</h2>
            <p>
                {isMod ? t('viewer.sourcesView.modsDescription') : t('viewer.sourcesView.pluginsDescription')}
            </p>
            {children}
        </div>
    );
}
