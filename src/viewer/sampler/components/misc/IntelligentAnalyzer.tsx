import {
    faBolt,
    faCheckCircle,
    faExclamationTriangle,
    faMicrochip,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useMemo } from 'react';
import { useLanguage } from '../../../../i18n';
import Panel from '../../../common/components/Panel';
import { formatTime } from '../../../common/util/format';
import SamplerData from '../../SamplerData';
import { getTopFunctions } from '../../utils/topFunctions';
import BasicVirtualNode from '../../node/BasicVirtualNode';
import VirtualNode from '../../node/VirtualNode';
import type { Highlight as SamplerHighlight } from '../../hooks/useHighlight';

interface Props {
    data: SamplerData;
    highlighted: SamplerHighlight;
}

export default function IntelligentAnalyzer({ data, highlighted }: Props) {
    const { t } = useLanguage();

    const analysis = useMemo(() => {
        const topFunctions = getTopFunctions(data, 1);
        const topFunction = topFunctions.length > 0 ? topFunctions[0] : null;

        // Determine server status
        // Heuristic: Check TPS or MSPT
        let status: 'good' | 'lagging' | 'severe' = 'good';
        let tps = 20;
        let mspt = 0;

        const windowStats = Object.values(data.timeWindowStatistics);
        if (windowStats.length > 0) {
            // Average MSPT of all windows
            const totalMspt = windowStats.reduce((sum, stat) => sum + stat.msptMedian, 0);
            mspt = totalMspt / windowStats.length;

            // Min TPS
            const minTps = windowStats.reduce((min, stat) => Math.min(min, stat.tps), 20);
            tps = minTps;
        } else if (data.metadata?.platformStatistics?.tps) {
            tps = data.metadata.platformStatistics.tps.last1M;
        }

        if (tps < 10 || mspt > 100) {
            status = 'severe';
        } else if (tps < 18 || mspt > 50) {
            status = 'lagging';
        }

        // Analysis text
        let analysisText = '';
        let mappedSource = topFunction?.source;
        let relatedNode: VirtualNode | null = null;

        if (!mappedSource && topFunction) {
            let currId = topFunction.node.getId();
            if (typeof currId === 'number') {
                let curr = data.nodes.getNode(currId);
                let depth = 0;
                // Backtrack up to 500 levels to find a parent with a source
                while (curr && depth < 500) {
                    const parent = data.nodes.getParent(curr.id);
                    if (!parent) break;

                    const parentSource = data.sources.getSource(parent.id);
                    if (parentSource) {
                        mappedSource = parentSource;
                        relatedNode = new BasicVirtualNode(data, parent);
                        break;
                    }
                    curr = parent;
                    depth++;
                }
            }
        }

        let sourceName = mappedSource || t('viewer.intelligentAnalyzer.unknownSource');
        if (!mappedSource && (topFunction?.name.startsWith('net.minecraft') || topFunction?.name.startsWith('java'))) {
            sourceName = 'Minecraft / Java';
        }

        if (status === 'good') {
            analysisText = t('viewer.intelligentAnalyzer.status.good');
        } else {
            if (sourceName === 'minecraft' || sourceName === 'java' || sourceName === 'Minecraft / Java') {
                analysisText = t('viewer.intelligentAnalyzer.vanillaIssue');
            } else if (mappedSource) {
                analysisText = t('viewer.intelligentAnalyzer.checkMod').replace('{source}', sourceName);
            } else {
                analysisText = t('viewer.intelligentAnalyzer.generatedInsights') + ' ' + (topFunction?.name || 'Unknown');
            }
        }

        return {
            status,
            topFunction,
            sourceName,
            analysisText,
            relatedNode
        };
    }, [data, t]);

    const statusColor = {
        good: '#4caf50',
        lagging: '#ff9800',
        severe: '#f44336',
    }[analysis.status];

    const statusIcon = {
        good: faCheckCircle,
        lagging: faExclamationTriangle,
        severe: faBolt,
    }[analysis.status];

    return (
        <Panel
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faMicrochip} />
                    {t('viewer.intelligentAnalyzer.title')}
                </div>
            }
        >
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '5px' }}>
                        {t('viewer.intelligentAnalyzer.serverStatus')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2em', fontWeight: 'bold', color: statusColor }}>
                        <FontAwesomeIcon icon={statusIcon} />
                        {t(`viewer.intelligentAnalyzer.status.${analysis.status}`)}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
                        {analysis.analysisText}
                    </div>
                </div>

                {analysis.topFunction && (
                    <>
                        <div
                            style={{ flex: 1, minWidth: '200px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', cursor: 'pointer' }}
                            onClick={() => {
                                if (analysis.topFunction) {
                                    highlighted.replace(analysis.topFunction.node);

                                    // Wait a short moment for the tree to auto-expand, then scroll to the node.
                                    const idVal = analysis.topFunction.node.getId();
                                    const id = `node-${Array.isArray(idVal) ? (idVal as number[]).join('-') : String(idVal)}`;
                                    // Try to scroll when element appears (retry a few times)
                                    const tryScroll = (attempt = 0) => {
                                        const el = document.getElementById(id);
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        } else if (attempt < 8) {
                                            setTimeout(() => tryScroll(attempt + 1), 100);
                                        }
                                    };
                                    setTimeout(() => tryScroll(), 50);
                                }
                            }}
                        >
                            <div style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '5px' }}>
                                {t('viewer.intelligentAnalyzer.topHotspot')}
                            </div>
                            <div style={{ fontSize: '1.1em', fontWeight: 'bold', wordBreak: 'break-all' }}>
                                {analysis.topFunction.name}
                            </div>
                            {analysis.relatedNode && (
                                <div style={{ fontSize: '0.85em', color: '#999', marginTop: '4px', wordBreak: 'break-all' }}>
                                    ↳ {analysis.sourceName}: {(() => {
                                        const details = analysis.relatedNode.getDetails();
                                        if (details.type === 'stackTrace') {
                                            return `${details.className}.${details.methodName}`;
                                        }
                                        return details.name;
                                    })()}
                                </div>
                            )}
                            <div style={{ color: '#ffc107', marginTop: '5px' }}>
                                {formatTime(analysis.topFunction.selfTime)} ms ({analysis.topFunction.percentage.toFixed(2)}%)
                            </div>
                        </div>

                        <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.9em', color: '#aaa', marginBottom: '5px' }}>
                                {t('viewer.intelligentAnalyzer.associatedSource')}
                            </div>
                            <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                {analysis.sourceName}
                            </div>
                            {(analysis.sourceName !== 'Minecraft / Java' && !['minecraft', 'java'].includes(analysis.sourceName) && analysis.topFunction.source) && (
                                <div style={{ fontSize: '0.8em', color: '#aaa', marginTop: '5px' }}>
                                    {t('viewer.sourceModal.suggestionsTitle')}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Panel>
    );
}
