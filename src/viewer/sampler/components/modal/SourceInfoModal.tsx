import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import { useLanguage } from '../../../../i18n';
import styles from './SourceInfoModal.module.scss';
import type { SamplerMetadata } from '../../../proto/spark_pb';
import type VirtualNode from '../../node/VirtualNode';
import { formatTime, humanFriendlyPercentage } from '../../../common/util/format';
import type { Highlight } from '../../hooks/useHighlight';

export interface SourceInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    // accept the node so we can traverse parents/children when source missing
    node?: VirtualNode | undefined;
    metadata?: SamplerMetadata | undefined;
    highlighted?: Highlight | undefined;
}

export default function SourceInfoModal({
    isOpen,
    onClose,
    node,
    metadata,
    highlighted,
}: SourceInfoModalProps) {
    const { t } = useLanguage();

    const sourceKey = useMemo(() => node?.getSource(), [node]);

    const sourceMeta = useMemo(() => {
        try {
            if (!sourceKey || !metadata) return undefined;
            // metadata.sources is a map of key -> PluginOrModMetadata
            return (metadata as any).sources?.[sourceKey];
        } catch (e) {
            return undefined;
        }
    }, [sourceKey, metadata]);

    const suggestions = useMemo< { key: string; total: number; percent: number }[]>(() => {
        if (!node || !metadata) return [] as { key: string; total: number; percent: number }[];

        // accumulate total time per source (sum of node.getTime())
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

            // enqueue neighbors (parents + children) for full traversal
            for (const p of cur.getParents()) {
                const pid = Array.isArray(p.getId()) ? (p.getId() as number[]).join('-') : String(p.getId());
                if (!visited.has(pid)) queue.push(p);
            }
            for (const c of cur.getChildren()) {
                const cid = Array.isArray(c.getId()) ? (c.getId() as number[]).join('-') : String(c.getId());
                if (!visited.has(cid)) queue.push(c);
            }
        }

        if (sourceKey) totals.delete(sourceKey);

        const entries = Array.from(totals.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([key, total]) => ({ key, total }));

        const sum = entries.reduce((acc, e) => acc + e.total, 0);

        // augment with percentage for rendering convenience
        return entries.map(e => ({ ...e, percent: sum > 0 ? e.total / sum : 0 }));
    }, [node, metadata, sourceKey]);

    // Find a representative node for a given source key by BFS from the current node
    function findRepresentative(sourceKeyToFind: string): VirtualNode | undefined {
        if (!node) return undefined;
        const visited = new Set<string>();
        const queue: VirtualNode[] = [node];
        while (queue.length) {
            const cur = queue.shift()!;
            const id = Array.isArray(cur.getId()) ? (cur.getId() as number[]).join('-') : String(cur.getId());
            if (visited.has(id)) continue;
            visited.add(id);

            if (cur.getSource() === sourceKeyToFind) return cur;

            for (const p of cur.getParents()) {
                const pid = Array.isArray(p.getId()) ? (p.getId() as number[]).join('-') : String(p.getId());
                if (!visited.has(pid)) queue.push(p);
            }
            for (const c of cur.getChildren()) {
                const cid = Array.isArray(c.getId()) ? (c.getId() as number[]).join('-') : String(c.getId());
                if (!visited.has(cid)) queue.push(c);
            }
        }
        return undefined;
    }
    function handleSuggestionClick(skey: string, highlighted?: Highlight) {
        const rep = findRepresentative(skey);
        if (!rep) return;

        // replace highlights with this node (so parents auto-expand)
        try {
            if (highlighted && typeof highlighted.replaceSilently === 'function') {
                highlighted.replaceSilently(rep);
            } else {
                highlighted?.replace(rep);
            }
        } catch (e) {
            // ignore
        }

        // scroll to node element id used by BaseNode
        const idVal = rep.getId();
        const elementId = `node-${Array.isArray(idVal) ? (idVal as number[]).join('-') : String(idVal)}`;
        setTimeout(() => {
            const el = document.getElementById(elementId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);

        onClose();
    }

    if (!isOpen) return null;

    function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    return (
        <div className={styles.backdrop} onClick={handleBackdropClick}>
            <div className={styles.modal} role="dialog" aria-modal>
                <div className={styles.header}>
                    <h2>{t('viewer.sourceModal.title')}</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label={t('common.close')}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className={styles.content}>
                    {!sourceKey && (
                        <div className={styles.empty}>{t('viewer.sourceModal.noSource')}</div>
                    )}

                    {sourceKey && (
                        <div className={styles.field}>
                            <div className="label">{t('viewer.sourceModal.sourceKey')}</div>
                            <div className="value">{sourceKey}</div>
                        </div>
                    )}

                    {sourceMeta ? (
                        <>
                            <div className={styles.field}>
                                <div className="label">{t('viewer.sourceModal.name')}</div>
                                <div className="value">{sourceMeta.name || '-'}</div>
                            </div>
                            <div className={styles.field}>
                                <div className="label">{t('viewer.sourceModal.version')}</div>
                                <div className="value">{sourceMeta.version || '-'}</div>
                            </div>
                            <div className={styles.field}>
                                <div className="label">{t('viewer.sourceModal.author')}</div>
                                <div className="value">{sourceMeta.author || '-'}</div>
                            </div>
                            {sourceMeta.description && (
                                <div className={styles.field}>
                                    <div className="label">{t('viewer.sourceModal.description')}</div>
                                    <div className="value">{sourceMeta.description}</div>
                                </div>
                            )}
                        </>
                    ) : (
                        sourceKey ? (
                            <div className={styles.empty}>{t('viewer.sourceModal.notFound')}</div>
                        ) : (
                            // show suggestions gathered from nearby nodes
                            <>
                                <div className={styles.field}>
                                    <div className="label">{t('viewer.sourceModal.suggestionsTitle')}</div>
                                    {suggestions.length === 0 ? (
                                        <div className="value">{t('viewer.sourceModal.suggestionsNone')}</div>
                                    ) : (
                                        <div className="value">
                                            <ul>
                                                {suggestions.map((s, i) => {
                                                            const md = (metadata as any).sources?.[s.key];
                                                            return (
                                                                <li key={i} onClick={() => handleSuggestionClick(s.key, highlighted)} style={{ cursor: 'pointer' }}>
                                                                    <span>
                                                                        {md?.name ? `${md.name}${md.version ? ' ' + md.version : ''}` : s.key}
                                                                    </span>
                                                                    <span style={{ float: 'right', color: '#9f9f9f' }}>
                                                                        {formatTime(s.total)}ms • {humanFriendlyPercentage(s.percent)}
                                                                    </span>
                                                                </li>
                                                            );
                                                        })}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
