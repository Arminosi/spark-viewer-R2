import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import TextBox from '../components/TextBox';
import { fetchFromRemote, FetchResult } from '../viewer/common/logic/fetch';
import { parse } from '../viewer/common/logic/parse';
import {
    FAILED_DATA,
    LOADED_HEALTH_DATA,
    LOADED_HEAP_DATA,
    LOADED_PROFILE_DATA,
    LOADING_DATA,
} from '../viewer/common/logic/status';
import { NextPageWithLayout } from './_app';

const SparkViewer = dynamic(() => import('../viewer/SparkViewer'), {
    ssr: false,
});

const RemoteViewer: NextPageWithLayout = () => {
    const router = useRouter();
    const [status, setStatus] = useState(LOADING_DATA);
    const [initialResult, setInitialResult] = useState<FetchResult | null>(null);

    useEffect(() => {
        const downloadPath = router.query.path as string;
        if (!downloadPath) return;

        (async () => {
            try {
                // Load remote file
                const result = await fetchFromRemote(downloadPath);
                const [, newStatus] = parse(result.type, result.buf);

                // Provide the result directly to the viewer component without
                // changing the URL.
                setInitialResult(result);
                setStatus(newStatus);
            } catch (error) {
                console.error('Failed to load remote file:', error);
                setStatus(FAILED_DATA);
            }
        })();
    }, [router.query.path, router]);

    if (status === LOADING_DATA) {
        return <TextBox>正在加载远程报告...</TextBox>;
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