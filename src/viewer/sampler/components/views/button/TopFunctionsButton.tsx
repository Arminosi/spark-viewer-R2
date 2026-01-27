import { faListOl } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLanguage } from '../../../../../i18n';

export interface TopFunctionsButtonProps {
    onClick: () => void;
}

export default function TopFunctionsButton({
    onClick,
}: TopFunctionsButtonProps) {
    const { t } = useLanguage();

    return (
        <div className="button top-functions-button">
            <button onClick={onClick} aria-label={t('viewer.sampler.topFunctions.button')}>
                <FontAwesomeIcon icon={faListOl} />{' '}
                <span>{t('viewer.sampler.topFunctions.button')}</span>
            </button>
        </div>
    );
}
