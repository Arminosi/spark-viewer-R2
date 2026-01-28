import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import TextBox from '../components/TextBox';
import { fetchFromRemote, FetchResult } from '../viewer/common/logic/fetch';
import { addToHistory } from '../viewer/common/logic/history';
import { parse } from '../viewer/common/logic/parse';
import {
    FAILED_DATA,
    LOADED_HEALTH_DATA,
    LOADED_HEAP_DATA,
    LOADED_PROFILE_DATA,
    LOADING_DATA,
} from '../viewer/common/logic/status';
import { NextPageWithLayout } from './_app';
import { env } from '../env';
import { RemoteReport } from '../hooks/useRemoteReports';

const SparkViewer = dynamic(() => import('../viewer/SparkViewer'), {
    ssr: false,
});

const RemoteViewer: NextPageWithLayout = () => {
    const router = useRouter();
    const [status, setStatus] = useState(LOADING_DATA);
    const [initialResult, setInitialResult] = useState<FetchResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [progress, setProgress] = useState<number | undefined>(undefined);

    useEffect(() => {
        const downloadPath = router.query.path as string;
        if (!downloadPath) return;

        (async () => {
            try {
                // Reset progress
                setProgress(undefined);

                // Load remote file with progress callback
                const result = await fetchFromRemote(downloadPath, (loaded, total) => {
                    if (total && total > 0) {
                        setProgress(Math.round((loaded / total) * 100));
                    } else {
                        setProgress(undefined);
                    }
                });
                const [, newStatus] = parse(result.type, result.buf);

                // Provide the result directly to the viewer component without
                // changing the URL.
                setInitialResult(result);
                setStatus(newStatus);

                // Add to history
                addToHistory({
                    id: downloadPath,
                    type: 'remote',
                    title: downloadPath.split('/').pop() || downloadPath,
                    description: new Date().toLocaleString()
                });
            } catch (error) {
                console.error('Failed to load remote file:', error);

                // Try to fetch the latest report as fallback
                try {
                    setErrorMessage('文件加载失败，正在尝试加载最新报告...');
                    const response = await fetch(`${env.NEXT_PUBLIC_SPARK_MONITOR_URL}/list`);
                    if (response.ok) {
                        const responseData = await response.json();
                        const reports: RemoteReport[] = responseData.value || responseData;

                        if (reports && reports.length > 0) {
                            // Sort by uploaded date (newest first)
                            const sortedReports = [...reports].sort((a, b) =>
                                new Date(b.uploaded).getTime() - new Date(a.uploaded).getTime()
                            );
                            const latestReport = sortedReports[0];

                            // Try to load the latest report with progress
                            setProgress(undefined);
                            const latestResult = await fetchFromRemote(latestReport.downloadPath, (loaded, total) => {
                                if (total && total > 0) {
                                    setProgress(Math.round((loaded / total) * 100));
                                } else {
                                    setProgress(undefined);
                                }
                            });
                            const [, latestStatus] = parse(latestResult.type, latestResult.buf);

                            setInitialResult(latestResult);
                            setStatus(latestStatus);
                            setErrorMessage('');
                            return;
                        }
                    }
                } catch (fallbackError) {
                    console.error('Failed to load latest report:', fallbackError);
                }

                setStatus(FAILED_DATA);
            }
        })();
    }, [router.query.path, router]);

    if (status === LOADING_DATA) {
        // Show progress bar when downloading
        const ProgressBar = require('../components/ProgressBar').default;
        return (
            <TextBox>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch', width: '100%' }}>
                    <div>{errorMessage || '正在加载远程报告...'}</div>
                    <div style={{ width: '100%' }}>
                        <ProgressBar percent={progress} />
                    </div>
                </div>
            </TextBox>
        );
    }

    if (status === FAILED_DATA) {
        return (
            <TextBox extraClassName="loading-error">
                无法加载远程报告。请检查网络连接或联系管理员。
            </TextBox>
        );
    }
    // If we have the initial result, render the viewer inline (no redirect).
    if (initialResult) {
        return <SparkViewer initialResult={initialResult} />;
    }

    return null;
};

export default RemoteViewer;