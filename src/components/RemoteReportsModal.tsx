import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import useRemoteReports from '../hooks/useRemoteReports';
import styles from '../style/remote-reports-modal.module.scss';

interface RemoteReportsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RemoteReportsModal({ isOpen, onClose }: RemoteReportsModalProps) {
    const router = useRouter();
    const { reports, isLoading, isError } = useRemoteReports();
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
                    <h2>远程报告库</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>
                
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label>开始日期:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={styles.dateInput}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>结束日期:</label>
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
                        清除筛选
                    </button>
                </div>
                
                <div className={styles.content}>
                    {isLoading && (
                        <div className={styles.loading}>
                            <div className={styles.loadingSpinner}></div>
                            <p>正在加载远程报告...</p>
                        </div>
                    )}
                    
                    {isError && (
                        <div className={styles.error}>
                            <p>无法连接到远程报告服务器</p>
                        </div>
                    )}
                    
                    {!isLoading && !isError && filteredReports.length === 0 && reports.length > 0 && (
                        <div className={styles.empty}>
                            <p>没有符合筛选条件的报告</p>
                        </div>
                    )}
                    
                    {!isLoading && !isError && reports.length === 0 && (
                        <div className={styles.empty}>
                            <p>暂无可用的远程报告</p>
                        </div>
                    )}
                    
                    {!isLoading && !isError && filteredReports.length > 0 && (
                        <div className={styles.reportsList}>
                            <div className={styles.listHeader}>
                                <span>生成时间</span>
                                <span>文件大小</span>
                                <span>操作</span>
                            </div>
                            {filteredReports.map(report => (
                                <div key={report.key} className={styles.reportItem}>
                                    <span className={styles.timestamp}>
                                        {new Date(report.uploaded).toLocaleString('zh-CN')}
                                    </span>
                                    <span className={styles.size}>
                                        {report.sizeMB}
                                    </span>
                                    <button 
                                        className={styles.loadButton}
                                        onClick={() => handleReportSelect(report.downloadPath)}
                                    >
                                        加载
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!isLoading && !isError && filteredReports.length > 0 && (
                        <div className={styles.summary}>
                            显示 {filteredReports.length} / {reports.length} 个报告
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}