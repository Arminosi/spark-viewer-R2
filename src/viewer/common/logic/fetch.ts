import { NextRouter } from 'next/router';
import { env } from '../../../env';
import {
    getContentType,
    getContentTypes,
    parseContentType,
    parseFileExtension,
    SparkContentType,
} from './contentType';
import { createExportCallback, ExportCallback } from './export';

export interface FetchResult {
    type: SparkContentType;
    buf: ArrayBuffer;
    exportCallback?: ExportCallback;
}

export async function fetchFromBytebin(
    code: string,
    router: NextRouter | null,
    thumbnail: boolean
) {
    let bytebinUrl = env.NEXT_PUBLIC_SPARK_BYTEBIN_URL;
    let bytebinApiKey = null;
    if (thumbnail && router && router.query['x-bytebin-url']) {
        bytebinUrl = router.query['x-bytebin-url'] as string;
    }
    if (thumbnail && router && router.query['x-bytebin-api-key']) {
        bytebinApiKey = router.query['x-bytebin-api-key'] as string;
    }

    const req = await fetch(`${bytebinUrl}/${code}`, {
        headers: {
            Accept: `${getContentTypes().join(',')}`,
            ...(bytebinApiKey ? { 'Bytebin-Api-Key': bytebinApiKey } : {}),
        },
    });
    if (!req.ok) {
        throw new Error('bytebin request failed');
    }

    const type = parseContentType(req.headers.get('content-type'));
    const buf = await req.arrayBuffer();
    const exportCallback = createExportCallback(code, buf, type);
    return { type, buf, exportCallback };
}

export async function fetchFromFile(selectedFile: File | undefined) {
    // load from selected file
    if (!selectedFile) {
        throw new Error('selectedFile is undefined');
    }

    const extension = parseFileExtension(selectedFile.name.split('.').pop());
    const type = getContentType(extension);
    const buf = await readFileAsync(selectedFile);
    return { type, buf };
}

export function readFileAsync(file: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = () => {
            resolve(reader.result as ArrayBuffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

export async function fetchFromRemote(
    downloadPath: string,
    onProgress?: (loaded: number, total?: number) => void
): Promise<FetchResult> {
    const fullUrl = `${env.NEXT_PUBLIC_SPARK_MONITOR_URL}${downloadPath}`;
    
    const response = await fetch(fullUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch remote file: ${response.status}`);
    }

    // Determine content type primarily from file extension
    let type: SparkContentType;
    const pathParts = downloadPath.split('.');
    const extension = pathParts[pathParts.length - 1];
    
    if (extension === 'sparkprofile') {
        type = 'application/x-spark-sampler';
    } else if (extension === 'sparkheap') {
        type = 'application/x-spark-heap';
    } else if (extension === 'sparkhealth') {
        type = 'application/x-spark-health';
    } else {
        // Try to determine from headers as fallback
        const contentType = response.headers.get('content-type');
        if (contentType && contentType !== 'application/octet-stream') {
            try {
                type = parseContentType(contentType);
            } catch {
                // Default to sampler if we can't determine
                type = 'application/x-spark-sampler';
            }
        } else {
            // Default to sampler if we can't determine
            type = 'application/x-spark-sampler';
        }
    }

    // Try to stream the response and report progress if possible
    const contentLengthHeader = response.headers.get('content-length');
    const total = contentLengthHeader ? parseInt(contentLengthHeader, 10) : undefined;

    let arrayBuffer: ArrayBuffer;

    if (!response.body || typeof response.body.getReader !== 'function') {
        // Fallback: no streaming support
        const buf = await response.arrayBuffer();
        if (onProgress) onProgress(buf.byteLength, total);
        arrayBuffer = buf;
    } else {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let receivedLength = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                chunks.push(value);
                receivedLength += value.length;
                if (onProgress) onProgress(receivedLength, total);
            }
        }

        // Concatenate chunks into single ArrayBuffer
        const result = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
            result.set(chunk, position);
            position += chunk.length;
        }

        arrayBuffer = result.buffer;
    }

    // Extract filename for export
    const filename = downloadPath.split('/').pop() || 'remote-report';
    const exportCallback = createExportCallback(filename.replace(/\.[^/.]+$/, ''), arrayBuffer, type);

    return { type, buf: arrayBuffer, exportCallback };
}
