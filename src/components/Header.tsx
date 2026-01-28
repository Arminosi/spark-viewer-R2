import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import RemoteReportsModal from './RemoteReportsModal';
import HistoryModal from './HistoryModal';
import SparkLogo from '../assets/spark-logo.svg';
import { useLanguage } from '../i18n';

import styles from '../style/header.module.scss';

export interface HeaderProps {
    title?: string;
}

export default function Header({ title = 'Artstyle | Spark Profiler' }: HeaderProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const { t, language, setLanguage } = useLanguage();

    // 检查是否在查看器页面（有code参数或远程加载）
    const isViewerPage = router.pathname === '/[code]' ||
        router.pathname === '/remote' ||
        (router.query.code && router.query.code !== '_');

    return (
        <>
            <header className={styles.header}>
                <Link href="/" className="logo">
                    <SparkLogo width="2.5em" height="2.5em" />
                    <h1>{title}</h1>
                </Link>

                {isViewerPage && (
                    <div className={styles.controls}>
                        <button
                            className={styles.remoteButton}
                            onClick={() => setIsModalOpen(true)}
                            title={t('header.openRemoteReports')}
                        >
                            <span className={styles.buttonIcon}>📡</span>
                            <span className={styles.buttonText}>{t('header.remoteReports')}</span>
                        </button>
                        <button
                            className={styles.remoteButton}
                            onClick={() => setIsHistoryOpen(true)}
                            title={t('history.openHistory')}
                        >
                            <span className={styles.buttonIcon}>🕒</span>
                            <span className={styles.buttonText}>{t('history.title')}</span>
                        </button>
                        <button
                            className={styles.languageButton}
                            onClick={() => setLanguage(language === 'zh-CN' ? 'en' : 'zh-CN')}
                            title={t('header.switchLanguage')}
                        >
                            {language === 'zh-CN' ? '中文' : 'EN'}
                        </button>
                    </div>
                )}
            </header>

            <RemoteReportsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </>
    );
}

export function HomepageHeader() {
    return (
        <div className={styles['homepage-header']}>
            <div>
                <SparkLogo />
                <div>
                    <h1>spark</h1>
                    <div>
                        A performance profiler for Minecraft
                        <br />
                        clients, servers, and proxies.
                    </div>
                </div>
            </div>
        </div>
    );
}
