import { useLanguage } from '../../../../../i18n';
import { HeaderProps } from './types';

export default function AllViewHeader({ children }: HeaderProps) {
    const { t } = useLanguage();
    return (
        <div className="header">
            <h2>{t('viewer.allView.title')}</h2>
            <p>
                {t('viewer.allView.description')}
            </p>
            {children}
        </div>
    );
}
