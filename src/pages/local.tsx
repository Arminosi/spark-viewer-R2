
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import TextBox from '../components/TextBox';
import { FetchResult } from '../viewer/common/logic/fetch';
import { createExportCallback } from '../viewer/common/logic/export';
import { parse } from '../viewer/common/logic/parse';
import { SparkContentType } from '../viewer/common/logic/contentType';
import {
    FAILED_DATA,
    LOADING_DATA,
} from '../viewer/common/logic/status';
import { NextPageWithLayout } from './_app';

const SparkViewer = dynamic(() => import('../viewer/SparkViewer'), {
    ssr: false,
});

const LocalViewer: NextPageWithLayout = () => {
    const router = useRouter();
    const [status, setStatus] = useState(LOADING_DATA);
    const [initialResult, setInitialResult] = useState<FetchResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const id = router.query.id as string;
        if (!id) return;

        (async () => {
            try {
                // Dynamically import IDB utils since they are browser-only
                const { idbGet } = await import('../viewer/common/util/idb');
                const buf = await idbGet(id);

                if (!buf) {
                    throw new Error('Cached file not found.');
                }

                // For local files we can assume 'local' source type, or we might store type in IDB.
                // But usually we just store the buffer. SparkViewer parses generic buffer.
                // We'll trust parse logic to detect type (heap/profile).
                // Or: Did we store type metadata? No, just buf.
                // So we pass generic assumption or detect.
                // Let's assume it's a generic buffer that parse() handles.

                // Note: FetchResult expects 'type'. `parse` creates type from data if possible?
                // `parse` takes (type, buf).
                // If we don't know the type, 'profile' is a safe default for spark logs 
                // but SparkViewer usually infers.
                // Actually `fetchFromFile` determines type from extension.
                // When we save, we should maybe save type too?
                // For now, let's look at SparkViewer parse. It needs a type hint.
                // However, `idbGet` returns ArrayBuffer.
                // Let's rely on SparkViewer to handle it.
                // Wait, SparkViewer `parse` function signatures:
                // export function parse(type: 'sampler' | 'heap' | 'health' | null, buf: ArrayBuffer): ...

                // If we don't save the type, we might have issues.
                // But for now let's try 'sampler' as default or inspect `idb` usage in SparkViewer.
                // In SparkViewer, lines 164: `const marker = { indexed: true, type, metadata, downloadPath };`
                // It saves METADATA to localStorage and CONTENT to IDB.

                // I should adopt a similar strategy for Local files. 
                // Store a descriptor in localStorage for metadata (like filename, type)
                // and content in IDB.

                // But `addToHistory` stores metadata in `localStorage` under `history`.
                // Maybe I can pass `type` in query param? `?id=...&type=...`

                const typeHint = router.query.type as SparkContentType | undefined;

                const result: FetchResult = {
                    type: typeHint || 'application/x-spark-sampler' as SparkContentType,
                    buf: buf,
                    exportCallback: createExportCallback(id, buf, typeHint || 'application/x-spark-sampler' as SparkContentType),
                };

                const [, newStatus] = parse(result.type, result.buf);
                setInitialResult(result);
                setStatus(newStatus);
            } catch (error) {
                console.error('Failed to load local cached file:', error);
                setErrorMessage('无法加载本地缓存文件。可能缓存已清理或失效。');
                setStatus(FAILED_DATA);
            }
        })();
    }, [router.query.id, router.query.type]);

    if (status === LOADING_DATA) {
        return (
            <TextBox>
                <div>{errorMessage || '正在加载缓存文件...'}</div>
            </TextBox>
        );
    }

    if (status === FAILED_DATA) {
        return (
            <TextBox extraClassName="loading-error">
                {errorMessage || '无法加载数据。'}
            </TextBox>
        );
    }

    if (initialResult) {
        return <SparkViewer initialResult={initialResult} />;
    }

    return null;
};

export default LocalViewer;
