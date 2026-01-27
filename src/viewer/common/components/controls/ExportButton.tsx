import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import FaButton from '../../../../components/FaButton';
import { useLanguage } from '../../../../i18n';
import { ExportCallback } from '../../logic/export';

export interface ExportButtonProps {
    exportCallback: ExportCallback;
}

export default function ExportButton({ exportCallback }: ExportButtonProps) {
    const { t } = useLanguage();
    if (!exportCallback) {
        return null;
    }
    return (
        <FaButton
            icon={faFileExport}
            onClick={exportCallback}
            title={t('viewer.controls.exportProfile')}
        />
    );
}
