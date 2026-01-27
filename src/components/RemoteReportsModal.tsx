import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import useRemoteReports from '../hooks/useRemoteReports';
import { useLanguage } from '../i18n';
import styles from '../style/remote-reports-modal.module.scss';

interface RemoteReportsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RemoteReportsModal({ isOpen, onClose }: RemoteReportsModalProps) {
    const router = useRouter();
    const { reports, isLoading, isError } = useRemoteReports();
    const { t, language } = useLanguage();
    const [selectedReport, setSelectedReport] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // 筛选后的报告列表
    const filteredReports = useMemo(() => {
        if (!reports || reports.length === 0) return [];
        
        let filtered = [...reports];
        
        // 按开始日期筛选
        if (startDate) {
            const start = new Date(startDate);
            filtered = filtered.filter(report => 
                new Date(report.uploaded) >= start
            );
        }
        
        // 按结束日期筛选
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // 包含整个结束日期
            filtered = filtered.filter(report => 
                new Date(report.uploaded) <= end
            );
        }
        
        // 按时间降序排列（最新的在前）
        return filtered.sort((a, b) => 
            new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime()
        );
    }, [reports, startDate, endDate]);

    const handleReportSelect = useCallback(
        (downloadPath: string) => {
            if (downloadPath) {
                onClose();
                router.push(`/remote?path=${encodeURIComponent(downloadPath)}`);
            }
        },
        [router, onClose]
    );

    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    const clearFilters = useCallback(() => {
        setStartDate('');
        setEndDate('');
    }, []);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>{t('modal.title')}</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>
                
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label>{t('modal.startDate')}:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>{t('modal.endDate')}:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                    <button
                        className={styles.clearButton}
                        onClick={clearFilters}
                        disabled={!startDate && !endDate}
                    >
                        {t('modal.clearFilters')}
                    </button>
                </div>
                
                <div className={styles.content}>
                    {isLoading && (
                        <div className={styles.loading}>
                            <div className={styles.loadingSpinner}></div>
                            <p>{t('modal.loading')}</p>
                        </div>
                    )}
                    
                    {isError && (
                        <div className={styles.error}>
                            <p>{t('modal.connectionError')}</p>
                        </div>
                    )}

                    {!isLoading && !isError && filteredReports.length === 0 && reports.length > 0 && (
                        <div className={styles.empty}>
                            <p>{t('modal.noMatchingReports')}</p>
                        </div>
                    )}

                    {!isLoading && !isError && reports.length === 0 && (
                        <div className={styles.empty}>
                            <p>{t('modal.noReports')}</p>
                        </div>
                    )}
                    
                    {!isLoading && !isError && filteredReports.length > 0 && (
                        <div className={styles.reportsList}>
                            <div className={styles.listHeader}>
                                <span>{t('modal.generatedTime')}</span>
                                <span>{t('modal.fileSize')}</span>
                                <span>{t('modal.actions')}</span>
                            </div>
                            {filteredReports.map(report => (
                                <div key={report.key} className={styles.reportItem}>
                                    <span className={styles.timestamp}>
                                        {new Date(report.uploaded).toLocaleString(language === 'zh-CN' ? 'zh-CN' : 'en-US')}
                                    </span>
                                    <span className={styles.size}>
                                        {report.sizeMB}
                                    </span>
                                    <button
                                        className={styles.loadButton}
                                        onClick={() => handleReportSelect(report.downloadPath)}
                                    >
                                        {t('modal.load')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!isLoading && !isError && filteredReports.length > 0 && (
                        <div className={styles.summary}>
                            {t('modal.showing')} {filteredReports.length} {t('modal.of')} {reports.length} {t('modal.reports')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}