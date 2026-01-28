import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import TextBox from '../components/TextBox';
import { useLanguage } from '../i18n';
import { SelectedFileContext } from '../pages/_app';
import { createExportCallback, ExportCallback } from './common/logic/export';
import {
    fetchFromBytebin,
    fetchFromFile,
    FetchResult,
    fetchFromRemote,
} from './common/logic/fetch';
import { addToHistory } from './common/logic/history';
import { parse } from './common/logic/parse';
import {
    FAILED_DATA,
    LOADED_HEALTH_DATA,
    LOADED_HEAP_DATA,
    LOADED_PROFILE_DATA,
    LOADING_DATA,
    Status,
} from './common/logic/status';
import Health from './health/Health';
import HealthData from './health/HealthData';
import HeapData from './heap/HeapData';
import { SparkMetadata } from './proto/guards';
import {
    HealthMetadata,
    HeapMetadata,
    SamplerMetadata,
} from './proto/spark_pb';
import SamplerData from './sampler/SamplerData';

const Heap = dynamic(() => import('./heap/Heap'));
const Sampler = dynamic(() => import('./sampler/components/Sampler'));

interface SparkViewerProps {
    // If provided, viewer will use this FetchResult directly instead of
    // attempting to fetch by `code` / bytebin. This is used by the /remote
    // page to render the viewer without changing the URL.
    initialResult?: FetchResult;
}

export default function SparkViewer({ initialResult }: SparkViewerProps) {
    const router = useRouter();

    const code = useMemo(() => {
        return router.query['code'] as string;
    }, [router]);

    const { selectedFile } = useContext(SelectedFileContext);
    const [status, setStatus] = useState<Status>(LOADING_DATA);
    const [data, setData] = useState<SamplerData | HeapData | HealthData>();
    const [metadata, setMetadata] = useState<SparkMetadata>();
    const [exportCallback, setExportCallback] = useState<ExportCallback>();
    const { t } = useLanguage();

    const fetchUpdatedData = useCallback(
        async (payloadId: string) => {
            const { type, buf, exportCallback } = await fetchFromBytebin(
                payloadId,
                null,
                false
            );
            setExportCallback(() => exportCallback);
            const [data] = parse(type, buf);
            setData(data);
            setMetadata(data.metadata);
        },
        [setExportCallback, setData]
    );

    useEffect(() => {
        // If an `initialResult` was provided, use it and skip the normal
        // fetching logic. This allows `/remote` to render the viewer without
        // changing the URL.
        if (initialResult) {
            try {
                if (initialResult.exportCallback) {
                    setExportCallback(() => initialResult.exportCallback);
                }
                const [parsedData, parsedStatus] = parse(
                    initialResult.type,
                    initialResult.buf
                );
                setData(parsedData);
                setMetadata(parsedData.metadata);
                setStatus(parsedStatus);
            } catch (e) {
                console.error('Failed to parse initial result for viewer', e);
                setStatus(FAILED_DATA);
            }
            return;
        }

        if (!code || status !== LOADING_DATA) {
            return;
        }

        (async () => {
            try {
                let result: FetchResult;

                // Check if this is a remote load from sessionStorage
                const isRemote = router.query.remote === 'true';
                const remoteDataKey = `remote_${code}`;

                if (isRemote && typeof window !== 'undefined') {
                    // Check sessionStorage first (same-tab). If missing, check
                    // localStorage for the IDB marker (so refresh/new-tab works).
                    let sessionData = sessionStorage.getItem(remoteDataKey);
                    if (!sessionData) {
                        sessionData = localStorage.getItem(remoteDataKey) ?? null;
                    }

                    if (sessionData) {
                        try {
                            const parsed = JSON.parse(sessionData);

                            if (parsed.indexed) {
                                const { idbGet, idbDelete } = await import('./common/util/idb');
                                let bufAB = await idbGet(remoteDataKey);

                                // If IDB missing, but marker contains the original
                                // download path, attempt to re-download as a fallback.
                                if (!bufAB && parsed.downloadPath) {
                                    try {
                                        const redownload = await fetchFromRemote(parsed.downloadPath);
                                        bufAB = redownload.buf as ArrayBuffer;
                                    } catch (redErr) {
                                        console.error('Failed to re-download remote payload:', redErr);
                                    }
                                }

                                if (!bufAB) throw new Error('Remote payload not found in IndexedDB or by re-download');

                                // Clean up IDB and storage markers
                                await idbDelete(remoteDataKey).catch(() => { });
                                sessionStorage.removeItem(remoteDataKey);
                                localStorage.removeItem(remoteDataKey);

                                result = {
                                    type: parsed.type,
                                    buf: bufAB,
                                    exportCallback: createExportCallback(code, bufAB, parsed.type),
                                };
                            } else {
                                const { data: arrayData, type, metadata, downloadPath } = parsed;
                                const buf = new Uint8Array(arrayData).buffer;

                                // Persist a copy into IndexedDB and write a marker to
                                // localStorage so refresh/new-tab can load later.
                                try {
                                    const { idbPut } = await import('./common/util/idb');
                                    await idbPut(remoteDataKey, buf);
                                    const marker = { indexed: true, type, metadata, downloadPath };
                                    try {
                                        localStorage.setItem(remoteDataKey, JSON.stringify(marker));
                                    } catch (lsErr) {
                                        console.warn('Failed to write localStorage marker', lsErr);
                                    }
                                } catch (idbErr) {
                                    console.warn('Failed to persist remote payload to IndexedDB:', idbErr);
                                }

                                // Clean up only sessionStorage (we keep localStorage marker)
                                sessionStorage.removeItem(remoteDataKey);

                                result = {
                                    type,
                                    buf,
                                    exportCallback: createExportCallback(code, buf, type),
                                };
                            }
                        } catch (parseError) {
                            console.error('Failed to parse remote session data:', parseError);
                            throw new Error('Invalid remote session data');
                        }
                    } else {
                        throw new Error('Remote session data not found');
                    }
                } else if (code !== '_') {
                    result = await fetchFromBytebin(code, router, false);
                } else {
                    result = await fetchFromFile(selectedFile);
                }

                if (result.exportCallback) {
                    setExportCallback(() => result.exportCallback);
                }

                const [data, status] = parse(result.type, result.buf);
                setData(data);
                setMetadata(data.metadata);
                setStatus(status);

                // Add to history if successful
                if (status !== FAILED_DATA && code !== '_') {
                    let type: 'remote' | 'bytebin' = 'bytebin';
                    let id = code;

                    if (isRemote && result && 'type' in result) { // it's remote
                        type = 'remote';
                        // We need the original path for the ID
                        const sessionData = sessionStorage.getItem(remoteDataKey)
                            || localStorage.getItem(remoteDataKey);
                        if (sessionData) {
                            const parsed = JSON.parse(sessionData);
                            if (parsed.downloadPath) {
                                id = parsed.downloadPath;
                            }
                        }
                    }

                    addToHistory({
                        id,
                        type,
                        title: id.split('/').pop(), // Simple filename as title
                        description: new Date().toLocaleString()
                    });
                }
            } catch (e) {
                console.log(e);
                setStatus(FAILED_DATA);
            }
        })();
    }, [initialResult, status, setStatus, code, selectedFile, router]);

    switch (status) {
        case LOADING_DATA:
            return (
                <TextBox>
                    {code === '_' ? 'Loading file...' : 'Downloading...'}
                </TextBox>
            );
        case FAILED_DATA:
            return (
                <TextBox extraClassName="loading-error">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            {t('viewer.failedLoad.message')}
                        </div>
                        <div>
                            <button onClick={() => router.push('/')} style={{ padding: '6px 10px', borderRadius: 4, background: 'linear-gradient(90deg,#ffc93a,#ffb300)', border: 'none', color: '#111', fontWeight: 600 }}>
                                {t('viewer.failedLoad.goHome')}
                            </button>
                        </div>
                    </div>
                </TextBox>
            );
        case LOADED_PROFILE_DATA:
            return (
                <Suspense fallback={<TextBox>Loading...</TextBox>}>
                    <Sampler
                        data={data as SamplerData}
                        fetchUpdatedData={fetchUpdatedData}
                        metadata={metadata as SamplerMetadata}
                        setMetadata={setMetadata}
                        exportCallback={exportCallback!}
                    />
                </Suspense>
            );
        case LOADED_HEAP_DATA:
            return (
                <Suspense fallback={<TextBox>Loading...</TextBox>}>
                    <Heap
                        data={data as HeapData}
                        metadata={metadata as HeapMetadata}
                        exportCallback={exportCallback!}
                    />
                </Suspense>
            );
        case LOADED_HEALTH_DATA:
            return (
                <Suspense fallback={<TextBox>Loading...</TextBox>}>
                    <Health
                        data={data as HealthData}
                        metadata={metadata as HealthMetadata}
                        exportCallback={exportCallback!}
                    />
                </Suspense>
            );
        default:
            return <TextBox>Unknown state - this is a bug.</TextBox>;
    }
}
