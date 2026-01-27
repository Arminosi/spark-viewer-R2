import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import FaButton from '../../../../components/FaButton';
import { useLanguage } from '../../../../i18n';
import { SparkMetadata } from '../../../proto/guards';
import { MetadataToggle } from '../../hooks/useMetadataToggle';

export interface ShowInfoButtonProps {
    metadata: SparkMetadata;
    metadataToggle: MetadataToggle;
}

export default function ShowInfoButton({
    metadata,
    metadataToggle,
}: ShowInfoButtonProps) {
    const { t } = useLanguage();
    if (!metadata.platform) {
        return null;
    }

    return (
        <FaButton
            icon={faInfoCircle}
            onClick={metadataToggle.toggleMetadata}
            title={t('viewer.controls.toggleMetadata')}
            extraClassName={metadataToggle.showMetadata ? 'toggled' : undefined}
        />
    );
}
