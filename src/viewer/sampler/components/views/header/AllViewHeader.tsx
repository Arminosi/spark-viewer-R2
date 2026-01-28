import { useLanguage } from '../../../../../i18n';
import { HeaderProps } from './types';

export default function AllViewHeader({ children }: HeaderProps) {
    const { t } = useLanguage();
    return (
        <>
            <h3>{t('viewer.allView.title')}</h3>
            <div className="header-controls">
                {children}
            </div>
        </>
    );
}
