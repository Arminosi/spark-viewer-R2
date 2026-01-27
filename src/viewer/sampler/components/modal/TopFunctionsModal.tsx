import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useContext, useMemo, useCallback, useState, useEffect } from 'react';
import type VirtualNode from '../../node/VirtualNode';
import BasicVirtualNode from '../../node/BasicVirtualNode';
import SamplerData from '../../SamplerData';
import { useLanguage } from '../../../../i18n';
import type { TopFunction } from '../../utils/topFunctions';
import { HighlightedContext, MetadataContext } from '../SamplerContext';
import styles from './TopFunctionsModal.module.scss';
import { formatTime, humanFriendlyPercentage } from '../../../common/util/format';

export interface TopFunctionsModalProps {
    topFunctions: TopFunction[];
    isOpen: boolean;
    onClose: () => void;
    onFunctionClick: (func: TopFunction) => void;
    data?: SamplerData;
}

export default function TopFunctionsModal({
    topFunctions,
    isOpen,
    onClose,
    onFunctionClick,
    data,
}: TopFunctionsModalProps) {
    const { t } = useLanguage();
    const highlighted = useContext(HighlightedContext)!;
    const metadata = useContext(MetadataContext)!;
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    // --- Performance optimizations ---
    // Cache computed top sources per node id to avoid repeated BFS work
    const topSourcesCache = useMemo(() => new Map<string, any[]>(), []);

    // Resolve a node from the display tree (with parent links) when possible.
    const resolveToTreeNode = useCallback((n: TopFunction['node']): TopFunction['node'] => {
        if (!data) return n;
        const targetId = Array.isArray(n.getId()) ? (n.getId() as number[]).join('-') : String(n.getId());

        // Build thread roots (these have parent links when their children are constructed)
        const roots: VirtualNode[] = data.threads.map(thread => new BasicVirtualNode(data, thread));

        const visited = new Set<string>();
        const queue: VirtualNode[] = [...roots];
        while (queue.length) {
            const cur = queue.shift()!;
            const id = Array.isArray(cur.getId()) ? (cur.getId() as number[]).join('-') : String(cur.getId());
            if (visited.has(id)) continue;
            visited.add(id);
            if (id === targetId) return cur;
            for (const c of cur.getChildren()) queue.push(c);
            for (const p of cur.getParents()) queue.push(p);
        }
        return n;
    }, [data]);

    // Helper: find top associated sources for a node
    const getTopSources = useCallback((node: TopFunction['node'], limit = 3) => {
        const totals = new Map<string, number>();
        const visited = new Set<string>();
        const queue: VirtualNode[] = [node];

        while (queue.length) {
            const cur = queue.shift()!;
            const id = Array.isArray(cur.getId()) ? (cur.getId() as number[]).join('-') : String(cur.getId());
            if (visited.has(id)) continue;
            visited.add(id);

            const s = cur.getSource();
            if (s) {
                const prev = totals.get(s) || 0;
                totals.set(s, prev + (typeof cur.getTime === 'function' ? cur.getTime() : 0));
            }

            for (const p of cur.getParents()) {
                const pid = Array.isArray(p.getId()) ? (p.getId() as number[]).join('-') : String(p.getId());
                if (!visited.has(pid)) queue.push(p);
            }
            for (const c of cur.getChildren()) {
                const cid = Array.isArray(c.getId()) ? (c.getId() as number[]).join('-') : String(c.getId());
                if (!visited.has(cid)) queue.push(c);
            }
        }

        // If the starting node has a direct source, exclude it from suggestions
        const startingSource = node.getSource && node.getSource();
        if (startingSource) totals.delete(startingSource);

        const entries = Array.from(totals.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([key, total]) => ({ key, total }));

        const sum = entries.reduce((acc, e) => acc + e.total, 0);

        return entries.map(e => ({
            key: e.key,
            total: e.total,
            percent: sum > 0 ? e.total / sum : 0,
            md: (metadata as any).sources?.[e.key],
        }));
    }, [metadata]);

    // We'll render quickly using a lightweight first-pass list, then compute full lists in background
    const [topSourcesList, setTopSourcesList] = useState<any[][]>(() => topFunctions.map(() => []));

    // Lightweight immediate guess: prefer node.getSource() or immediate neighbors' sources
    const quickFirst = useCallback((node: TopFunction['node']) => {
        const s = node.getSource && node.getSource();
        if (s) return [{ key: s, total: typeof node.getTime === 'function' ? node.getTime() : 0, percent: 1, md: (metadata as any).sources?.[s] }];
        for (const c of node.getChildren()) {
            const cs = c.getSource && c.getSource();
            if (cs) return [{ key: cs, total: typeof c.getTime === 'function' ? c.getTime() : 0, percent: 1, md: (metadata as any).sources?.[cs] }];
        }
        for (const p of node.getParents()) {
            const ps = p.getSource && p.getSource();
            if (ps) return [{ key: ps, total: typeof p.getTime === 'function' ? p.getTime() : 0, percent: 1, md: (metadata as any).sources?.[ps] }];
        }
        return [];
    }, [metadata]);

    // When modal opens, kick off async computation of full lists without blocking render
    useEffect(() => {
        if (!isOpen) return;
        // immediate quick fill so UI is responsive
        setTopSourcesList(topFunctions.map(f => quickFirst(resolveToTreeNode(f.node))));

        // compute heavy work in background
        const handle = setTimeout(() => {
            const results: any[][] = topFunctions.map(() => []);
            const MAX_VISIT = 2000; // safeguard to prevent pathological traversals
            for (let i = 0; i < topFunctions.length; i++) {
                const f = topFunctions[i];
                const resolved = resolveToTreeNode(f.node);
                const id = Array.isArray(resolved.getId()) ? (resolved.getId() as number[]).join('-') : String(resolved.getId());
                if (topSourcesCache.has(id)) {
                    results[i] = topSourcesCache.get(id)!;
                    continue;
                }

                // BFS with visit cap
                const totals = new Map<string, number>();
                const visited = new Set<string>();
                const queue: VirtualNode[] = [resolved];
                let visits = 0;
                while (queue.length && visits < MAX_VISIT) {
                    const cur = queue.shift()!;
                    visits++;
                    const cid = Array.isArray(cur.getId()) ? (cur.getId() as number[]).join('-') : String(cur.getId());
                    if (visited.has(cid)) continue;
                    visited.add(cid);
                    const s = cur.getSource && cur.getSource();
                    if (s) {
                        totals.set(s, (totals.get(s) || 0) + (typeof cur.getTime === 'function' ? cur.getTime() : 0));
                    }
                    for (const p of cur.getParents()) queue.push(p);
                    for (const c of cur.getChildren()) queue.push(c);
                }

                const startingSource = resolved.getSource && resolved.getSource();
                if (startingSource) totals.delete(startingSource);

                const entries = Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([key, total]) => ({ key, total }));
                const sum = entries.reduce((acc, e) => acc + e.total, 0);
                const final = entries.map(e => ({ key: e.key, total: e.total, percent: sum > 0 ? e.total / sum : 0, md: (metadata as any).sources?.[e.key] }));
                results[i] = final;
                topSourcesCache.set(id, final);
            }
            setTopSourcesList(results);
        }, 10);

        return () => clearTimeout(handle);
    // intentionally exclude topSourcesCache from deps (stable), include funcs and flags
    }, [isOpen, topFunctions, resolveToTreeNode, quickFirst]);

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
                                    {(() => {
                                        // Prefer the top associated source computed by getTopSources
                                        const top = topSourcesList[index] && topSourcesList[index][0];
                                        const srcKey = top?.key ?? func.node.getSource();
                                        const md = srcKey && metadata ? (metadata as any).sources?.[srcKey] : undefined;
                                        if (md) {
                                            return (
                                                <div className={styles.functionMeta}>
                                                    {md.name}{md.version ? ' ' + md.version : ''}
                                                </div>
                                            );
                                        }
                                        // If no metadata, show the source key if available
                                        if (srcKey) {
                                            return (
                                                <div className={styles.functionMeta}>
                                                    {srcKey}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                    <div className={styles.functionStats}>
                                        {(() => {
                                            const p = func.percentage;
                                            // thresholds: <=70 green, >70 && <=90 orange, >90 red
                                            let severityClass = styles.pctLow;
                                            if (p > 90) severityClass = styles.pctHigh;
                                            else if (p > 70) severityClass = styles.pctMed;

                                            return (
                                                <>
                                                    <span className={`${styles.time} ${severityClass}`}>
                                                        {func.selfTime.toFixed(0)} ms
                                                    </span>
                                                    <span className={`${styles.percentage} ${severityClass}`}>
                                                        {func.percentage.toFixed(2)}%
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    {/* associated sources: show first by default, allow expand */}
                                    <div className={styles.sourceList} onClick={e => e.stopPropagation()}>
                                        {topSourcesList[index] && topSourcesList[index].length > 0 && (
                                            <div className={styles.sourceItem}>
                                                <div className={styles.sourceName}>{topSourcesList[index][0].md?.name ? `${topSourcesList[index][0].md.name}${topSourcesList[index][0].md.version ? ' ' + topSourcesList[index][0].md.version : ''}` : topSourcesList[index][0].key}</div>
                                                <div className={styles.sourceStats}>{formatTime(topSourcesList[index][0].total)}ms • {humanFriendlyPercentage(topSourcesList[index][0].percent)}</div>
                                            </div>
                                        )}
                                        {topSourcesList[index] && topSourcesList[index].length > 1 && (
                                            <div className={styles.expandRow}>
                                                <button
                                                    className={styles.expandButton}
                                                    onClick={() => setExpanded(prev => ({ ...prev, [index]: !prev[index] }))}
                                                    aria-expanded={!!expanded[index]}
                                                >
                                                    {expanded[index] ? t('viewer.sampler.topFunctions.collapse') : `${t('viewer.sampler.topFunctions.more')} (+${topSourcesList[index].length - 1})`}
                                                </button>
                                            </div>
                                        )}
                                        {expanded[index] && topSourcesList[index].slice(1).map((s: any, idx: number) => (
                                            <div key={idx} className={styles.sourceItem}>
                                                <div className={styles.sourceName}>{s.md?.name ? `${s.md.name}${s.md.version ? ' ' + s.md.version : ''}` : s.key}</div>
                                                <div className={styles.sourceStats}>{formatTime(s.total)}ms • {humanFriendlyPercentage(s.percent)}</div>
                                            </div>
                                        ))}
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
