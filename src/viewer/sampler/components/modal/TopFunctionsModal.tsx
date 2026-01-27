import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext } from 'react';
import { useLanguage } from '../../../../i18n';
import type { TopFunction } from '../../utils/topFunctions';
import { HighlightedContext } from '../SamplerContext';
import styles from './TopFunctionsModal.module.scss';

export interface TopFunctionsModalProps {
    topFunctions: TopFunction[];
    isOpen: boolean;
    onClose: () => void;
    onFunctionClick: (func: TopFunction) => void;
}

export default function TopFunctionsModal({
    topFunctions,
    isOpen,
    onClose,
    onFunctionClick,
}: TopFunctionsModalProps) {
    const { t } = useLanguage();
    const highlighted = useContext(HighlightedContext)!;

    if (!isOpen) return null;

    function handleFunctionClick(func: TopFunction) {
        // Use replace to atomically replace all highlights with just this node
        // This triggers only one URL update instead of two (clear + toggle)
        highlighted.replace(func.node);
        // Call the callback to expand the tree
        onFunctionClick(func);
        // Close the modal
        onClose();
    }

    function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>{t('viewer.sampler.topFunctions.title')}</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className={styles.content}>
                    <div className={styles.functionList}>
                        {topFunctions.map((func, index) => (
                            <div
                                key={index}
                                className={styles.functionItem}
                                onClick={() => handleFunctionClick(func)}
                            >
                                <div className={styles.rank}>{index + 1}</div>
                                <div className={styles.functionInfo}>
                                    <div className={styles.functionName}>
                                        {func.name}
                                    </div>
                                    <div className={styles.functionStats}>
                                        <span className={styles.time}>
                                            {func.selfTime.toFixed(0)} ms
                                        </span>
                                        <span className={styles.percentage}>
                                            {func.percentage.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
