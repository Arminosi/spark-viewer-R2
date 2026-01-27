import { useLanguage } from '../../../../../i18n';
import { HeaderProps } from './types';

export default function FlatViewHeader({ children }: HeaderProps) {
    const { t } = useLanguage();
    return (
        <div className="header">
            <h2>{t('viewer.flatView.title')}</h2>
            <p>
                {t('viewer.flatView.description')}
            </p>
            {children}
        </div>
    );
}
