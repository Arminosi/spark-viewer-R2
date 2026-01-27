import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { Item, ItemParams, Menu } from 'react-contexify';
import styles from '../../../style/sampler.module.scss';
import VersionWarning from '../../common/components/VersionWarning';
import WidgetsAndMetadata from '../../common/components/WidgetsAndMetadata';
import useMetadataToggle from '../../common/hooks/useMetadataToggle';
import useToggle from '../../common/hooks/useToggle';
import { ExportCallback } from '../../common/logic/export';
import { SamplerMetadata } from '../../proto/spark_pb';
import useHighlight from '../hooks/useHighlight';
import useSearchQuery from '../hooks/useSearchQuery';
import useSocketBindings from '../hooks/useSocketBindings';
import useSocketClient from '../hooks/useSocketClient';
import useTimeSelector from '../hooks/useTimeSelector';
import VirtualNode from '../node/VirtualNode';
import SamplerData from '../SamplerData';
import { FlatViewData } from '../worker/FlatViewGenerator';
import RemoteSamplerWorker from '../worker/RemoteSamplerWorker';
import { SourcesViewData } from '../worker/SourceViewGenerator';
import Controls from './controls/Controls';
import Flame from './flamegraph/Flame';
import NoData from './misc/NoData';
import SocketInfo from './misc/SocketInfo';
import SamplerContext from './SamplerContext';
import AllView from './views/AllView';
import FlatView from './views/FlatView';
import SourcesView from './views/SourcesView';
import { View, VIEW_ALL, VIEW_FLAT } from './views/types';

const Graph = dynamic(() => import('./graph/Graph'));

import 'react-contexify/dist/ReactContexify.css';
import { Tooltip } from 'react-tooltip';
import { formatTime, humanFriendlyPercentage } from '../../common/util/format';
import useInfoPoints from '../hooks/useInfoPoints';
import useMappings from '../hooks/useMappings';
import SettingsMenu from './settings/SettingsMenu';
import { useLanguage } from '../../../i18n';
import SourceInfoModal from './modal/SourceInfoModal';

export interface SamplerProps {
    data: SamplerData;
    fetchUpdatedData: (payloadId: string) => void;
    metadata: SamplerMetadata;
    setMetadata: (metadata: SamplerMetadata) => void;
    exportCallback: ExportCallback;
}

export default function Sampler({
    data,
    fetchUpdatedData,
    metadata,
    setMetadata,
    exportCallback,
}: SamplerProps) {
    const searchQuery = useSearchQuery(data);
    const highlighted = useHighlight();
    const [labelMode, setLabelMode] = useState(false);
    const timeSelector = useTimeSelector(
        data.timeWindows,
        data.timeWindowStatistics
    );
    const mappings = useMappings(metadata);
    const infoPoints = useInfoPoints();
    const [flameData, setFlameData] = useState<VirtualNode>();
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [sourceNode, setSourceNode] = useState<VirtualNode | undefined>();
    const [view, setView] = useState<View>(VIEW_ALL);
    const [showGraph, setShowGraph] = useToggle('prefShowGraph', true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showSocketInfo, setShowSocketInfo] = useToggle(
        'prefShowSocket',
        false
    );

    const [flatViewData, setFlatViewData] = useState<FlatViewData>();
    const [sourcesViewData, setSourcesViewData] = useState<SourcesViewData>();

    // Generate flat & sources view in the background on first load
    useEffect(() => {
        (async () => {
            const worker = await RemoteSamplerWorker.create(data);

            if (data.sources.hasSources()) {
                const sourcesView = await worker.generateSourcesView();
                setSourcesViewData(sourcesView);
            }

            const flatView = await worker.generateFlatView();
            setFlatViewData(flatView);

            worker.close();
        })();
    }, [data]);

    // WebSocket
    const socketClient = useSocketClient(data.channelInfo, fetchUpdatedData);
    const socket = useSocketBindings({
        socket: socketClient,
        fetchUpdatedData,
        metadata,
        setMetadata,
    });

    const metadataToggle = useMetadataToggle();

    // Callback function for the "Toggle bookmark" context menu button
    function handleHighlight(args: ItemParams<{ node: VirtualNode }>) {
        if (!args.props) return;
        highlighted.toggle(args.props.node);
    }

    // Callback function for the "Clear all bookmarks" context menu button
    function handleHighlightClear() {
        highlighted.clear();
    }

    // Callback function for the "View as Flame Graph" context menu button
    function handleFlame(args: ItemParams<{ node: VirtualNode }>) {
        const node = args.props?.node;
        if (!node) return;
        setFlameData(node);
    }

    function handleShowSource(args: ItemParams<{ node: VirtualNode }>) {
        const node = args.props?.node;
        if (!node) return;
        setSourceNode(node);
        setShowSourceModal(true);
    }

    function handleCopyFunctionName(args: ItemParams<{ node: VirtualNode }>) {
        const node = args.props?.node;
        if (!node) return;

        const details = node.getDetails();
        let name = '';
        if (details.type === 'thread') {
            name = details.name;
        } else {
            name = `${details.className}.${details.methodName}`;
            if (details.lineNumber !== undefined && details.lineNumber !== null) {
                name += `:${details.lineNumber}`;
            }
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(name).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = name;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            });
        } else {
            const ta = document.createElement('textarea');
            ta.value = name;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
    }

    function handleCopyParentChain(args: ItemParams<{ node: VirtualNode }>) {
        const node = args.props?.node;
        if (!node) return;

        // Build chain from this node up to the topmost parent
        const chain: VirtualNode[] = [];
        let cur: VirtualNode | undefined = node;
        while (cur) {
            chain.push(cur);
            const parents = cur.getParents();
            cur = parents && parents.length > 0 ? parents[0] : undefined;
        }

        // We want root -> ... -> current, so reverse the collected chain
        const ordered = chain.slice().reverse();
        const root = ordered[0];
        const rootTime = root ? timeSelector.getTime(root) : 0;

        const lines = ordered.map((n, idx) => {
            const details = n.getDetails();
            let name = '';
            if (details.type === 'thread') {
                name = details.name;
            } else {
                name = `${details.className}.${details.methodName}`;
                if (details.lineNumber !== undefined && details.lineNumber !== null) {
                    name += `:${details.lineNumber}`;
                }
            }
            const t = timeSelector.getTime(n);
            const pct = rootTime ? t / rootTime : 0;
            const indent = '  '.repeat(idx); // two spaces per level
            return `${indent}${name} — ${formatTime(t)} ms (${humanFriendlyPercentage(pct)})`;
        });

        const text = lines.join('\n');

        // Try clipboard API, fall back to textarea
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            });
        } else {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            ta.remove();
        }
    }

    const { t } = useLanguage();

    const supported =
        metadata?.platform?.sparkVersion && metadata.platform.sparkVersion >= 2;

    return (
        <div className={styles.sampler}>
            <Controls
                data={data}
                metadata={metadata}
                metadataToggle={metadataToggle}
                exportCallback={exportCallback}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                view={view}
                setView={setView}
                sourcesViewSupported={data.sources.hasSources()}
                graphSupported={timeSelector.supported}
                showGraph={showGraph}
                setShowGraph={setShowGraph}
                socket={socket}
                showSocketInfo={showSocketInfo}
                setShowSocketInfo={setShowSocketInfo}
                flameData={flameData}
                setFlameData={setFlameData}
                searchQuery={searchQuery}
            />

            {showSettings && (
                <SettingsMenu
                    mappingsMetadata={mappings.mappingsMetadata}
                    mappings={mappings.mappingsType}
                    setMappings={mappings.requestMappings}
                    infoPoints={infoPoints.enabled}
                    toggleInfoPoints={infoPoints.toggleEnabled}
                />
            )}

            {showSocketInfo && socket.socket.socket && (
                <SocketInfo socket={socket} />
            )}

            {!supported && <VersionWarning />}

            <WidgetsAndMetadata
                metadata={metadata}
                metadataToggle={metadataToggle}
            />

            {timeSelector.supported && (
                <Suspense fallback={null}>
                    <Graph
                        show={showGraph}
                        timeSelector={timeSelector}
                        windowStatistics={data.timeWindowStatistics}
                    />
                </Suspense>
            )}

            {!!flameData && (
                <Flame
                    flameData={flameData}
                    mappings={mappings.mappingsResolver}
                    metadata={metadata}
                    timeSelector={timeSelector}
                />
            )}

            <div style={{ display: flameData ? 'none' : undefined }}>
                <SamplerContext
                    mappings={mappings.mappingsResolver}
                    infoPoints={infoPoints}
                    highlighted={highlighted}
                    searchQuery={searchQuery}
                    labelMode={labelMode}
                    metadata={metadata}
                    timeSelector={timeSelector}
                >
                    {view === VIEW_ALL ? (
                        <AllView data={data} setLabelMode={setLabelMode} />
                    ) : view === VIEW_FLAT ? (
                        <FlatView
                            data={data}
                            viewData={flatViewData}
                            setLabelMode={setLabelMode}
                        />
                    ) : (
                        <SourcesView
                            data={data}
                            viewData={sourcesViewData}
                            setLabelMode={setLabelMode}
                        />
                    )}
                    {infoPoints.enabled && (
                        <Tooltip
                            id="infopoint-tooltip"
                            place="right"
                            className="infopoint-tooltip"
                            clickable
                        />
                    )}
                </SamplerContext>
            </div>

            {data.threads.length === 0 && (
                <NoData isConnectedToSocket={!!socket.socket.socket} />
            )}

            <Menu id={'sampler-cm'} theme="dark">
                <Item onClick={handleFlame}>{t('viewer.contextMenu.viewAsFlame')}</Item>
                <Item onClick={handleShowSource}>{t('viewer.contextMenu.showSource')}</Item>
                <Item onClick={handleCopyParentChain}>{t('viewer.contextMenu.copyFullChain')}</Item>
                <Item onClick={handleCopyFunctionName}>{t('viewer.contextMenu.copyFunctionName')}</Item>
                <Item onClick={handleHighlight}>{t('viewer.contextMenu.toggleBookmark')}</Item>
                <Item onClick={handleHighlightClear}>{t('viewer.contextMenu.clearBookmarks')}</Item>
            </Menu>

            <SourceInfoModal
                isOpen={showSourceModal}
                onClose={() => setShowSourceModal(false)}
                node={sourceNode}
                metadata={metadata}
                highlighted={highlighted}
            />
        </div>
    );
}
