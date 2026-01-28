
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getHistory, HistoryItem, clearHistory } from '../viewer/common/logic/history';
import { useLanguage } from '../i18n';
import styles from '../style/remote-reports-modal.module.scss';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            setHistory(getHistory());
        }
    }, [isOpen]);

    const handleReportSelect = useCallback(
        (item: HistoryItem) => {
            onClose();
            if (item.type === 'remote') {
                router.push(`/remote?path=${encodeURIComponent(item.id)}`);
            } else if (item.type === 'bytebin') {
                router.push(`/${item.id}`);
            }
        },
        [router, onClose]
    );

    const handleClearHistory = useCallback(() => {
        if (confirm(t('history.confirmClear'))) {
            clearHistory();
            setHistory([]);
        }
    }, [t]);

    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>{t('history.title')}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.filters}>
                    <div style={{ flex: 1 }}></div>
                    <button
                        className={styles.clearButton}
                        onClick={handleClearHistory}
                        disabled={history.length === 0}
                    >
                        {t('history.clear')}
                    </button>
                </div>

                <div className={styles.content}>
                    {history.length === 0 && (
                        <div className={styles.empty}>
                            <p>{t('history.noHistory')}</p>
                        </div>
                    )}

                    {history.length > 0 && (
                        <div className={styles.reportsList}>
                            <div className={styles.listHeader}>
                                <span>{t('history.date')}</span>
                                <span>{t('history.type')}</span>
                                <span>{t('history.id')}</span>
                                <span>{t('modal.actions')}</span>
                            </div>
                            {history.map((item, index) => (
                                <div key={index} className={styles.reportItem}>
                                    <span className={styles.timestamp}>
                                        {new Date(item.timestamp).toLocaleString(language === 'zh-CN' ? 'zh-CN' : 'en-US')}
                                    </span>
                                    <span className={styles.size}>
                                        {item.type === 'bytebin' ? 'Official' : 'Remote'}
                                    </span>
                                    <span className={styles.size} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.id}>
                                        {item.id.replace(/^.*[\\/]/, '')}
                                    </span>
                                    <button
                                        className={styles.loadButton}
                                        onClick={() => handleReportSelect(item)}
                                    >
                                        {t('modal.load')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
