import { Dispatch, SetStateAction } from 'react';
import styles from '../../../../style/controls.module.scss';
import ExportButton from '../../../common/components/controls/ExportButton';
import { MetadataToggle } from '../../../common/hooks/useMetadataToggle';
import { ExportCallback } from '../../../common/logic/export';
import { SamplerMetadata } from '../../../proto/spark_pb';
import { SearchQuery } from '../../hooks/useSearchQuery';
import { SocketBinding } from '../../hooks/useSocketBindings';
import VirtualNode from '../../node/VirtualNode';
import SamplerData from '../../SamplerData';
import SamplerTitle from '../SamplerTitle';
import { View } from '../views/types';
import LastUpdateSpinner from './LastUpdateSpinner';
import SearchBar from './SearchBar';
import SettingsButton from './SettingsButton';


export interface ControlsProps {
    data: SamplerData;
    metadata: SamplerMetadata;
    metadataToggle: MetadataToggle;
    exportCallback: ExportCallback;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    view: View;
    setView: Dispatch<SetStateAction<View>>;
    sourcesViewSupported: boolean;
    graphSupported: boolean;
    showGraph: boolean;
    setShowGraph: Dispatch<SetStateAction<boolean>>;
    socket: SocketBinding;
    showSocketInfo: boolean;
    setShowSocketInfo: Dispatch<SetStateAction<boolean>>;
    flameData?: VirtualNode;
    setFlameData: Dispatch<SetStateAction<VirtualNode | undefined>>;
    searchQuery: SearchQuery;
}

export default function Controls({
    data,
    metadata,
    metadataToggle,
    exportCallback,
    showSettings,
    setShowSettings,
    view,
    setView,
    sourcesViewSupported,
    graphSupported,
    showGraph,
    setShowGraph,
    socket,
    showSocketInfo,
    setShowSocketInfo,
    flameData,
    setFlameData,
    searchQuery,
}: ControlsProps) {
    return (
        <div className={styles.controls}>
            <SamplerTitle metadata={metadata} />
            <SettingsButton
                showSettings={showSettings}
                setShowSettings={setShowSettings}
            />
            <ExportButton exportCallback={exportCallback} />
            <SearchBar searchQuery={searchQuery} />
            <LastUpdateSpinner
                socket={socket}
                showSocketInfo={showSocketInfo}
                setShowSocketInfo={setShowSocketInfo}
            />
        </div>
    );
}
