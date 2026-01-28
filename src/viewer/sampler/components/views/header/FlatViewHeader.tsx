import { useLanguage } from '../../../../../i18n';
import { HeaderProps } from './types';

export default function FlatViewHeader({ children }: HeaderProps) {
    const { t } = useLanguage();
    return (
        <>
            <h3>{t('viewer.flatView.title')}</h3>
            <div className="header-controls">
                {children}
            </div>
        </>
    );
}
