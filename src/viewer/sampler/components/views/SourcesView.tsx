import { Dispatch, SetStateAction, useContext, useState } from 'react';
import TextBox from '../../../../components/TextBox';
import SourceThreadVirtualNode from '../../node/SourceThreadVirtualNode';
import SamplerData from '../../SamplerData';
import {
    SourcesViewData,
    SourceViewData,
} from '../../worker/SourceViewGenerator';
import { LabelModeContext, MetadataContext } from '../SamplerContext';
import BaseNode from '../tree/BaseNode';
import LabelModeButton from './button/LabelModeButton';
import MergeModeButton from './button/MergeModeButton';
import SourcesViewHeader from './header/SourcesViewHeader';
import TopFunctionsButton from './button/TopFunctionsButton';
import TopFunctionsModal from '../modal/TopFunctionsModal';
import { getTopFunctions, TopFunction } from '../../utils/topFunctions';

import { View } from '../views/types';
import ViewSwitcher from './button/ViewSwitcher';
import { SamplerMetadata } from '../../../proto/spark_pb';

export interface SourcesViewProps {
    data: SamplerData;
    viewData?: SourcesViewData;
    setLabelMode: Dispatch<SetStateAction<boolean>>;
    view: View;
    setView: Dispatch<SetStateAction<View>>;
    sourcesViewSupported: boolean;
    metadata: SamplerMetadata;
}

// The sampler view in which there is a stack displayed for each known source.
export default function SourcesView({
    data,
    viewData,
    setLabelMode,
    view,
    setView,
    sourcesViewSupported,
    metadata
}: SourcesViewProps) {
    const labelMode = useContext(LabelModeContext);
    const [merged, setMerged] = useState(true);
    const sourceNodes = merged ? viewData?.sourcesMerged : viewData?.sourcesSeparate;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topFunctions, setTopFunctions] = useState<TopFunction[]>([]);

    return (
        <>
            <div className="sourceview">
                <SourcesViewHeader>
                    <TopFunctionsButton onClick={() => {
                        const functions = getTopFunctions(data, 20);
                        setTopFunctions(functions);
                        setIsModalOpen(true);
                    }} />
                    <div style={{ marginLeft: 6 }}></div>
                    <ViewSwitcher
                        metadata={metadata}
                        view={view}
                        setView={setView}
                        sourcesViewSupported={sourcesViewSupported}
                    />
                    <LabelModeButton
                        labelMode={labelMode}
                        setLabelMode={setLabelMode}
                    />
                    <MergeModeButton merged={merged} setMerged={setMerged} />
                </SourcesViewHeader>

                {!sourceNodes ? (
                    <TextBox>Loading...</TextBox>
                ) : (
                    <>
                        {sourceNodes.map(viewData => (
                            <SourceSection
                                data={data}
                                viewData={viewData}
                                key={viewData.source}
                            />
                        ))}
                        <OtherSourcesSection
                            alreadyShown={sourceNodes.map(s => s.source)}
                        />
                    </>
                )}
            </div>
            <TopFunctionsModal
                topFunctions={topFunctions}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onFunctionClick={(func) => {
                    const idVal = func.node.getId();
                    const id = `node-${Array.isArray(idVal) ? (idVal as number[]).join('-') : String(idVal)}`;
                    const tryScroll = (attempt = 0) => {
                        const el = document.getElementById(id);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else if (attempt < 8) {
                            setTimeout(() => tryScroll(attempt + 1), 100);
                        }
                    };
                    setTimeout(() => tryScroll(), 50);
                }}
                data={data}
            />
        </>
    );
}

const formatVersion = (version: string) => {
    return version.startsWith('v') ? version : 'v' + version;
};

interface SourceSectionProps {
    data: SamplerData;
    viewData: SourceViewData;
}

const SourceSection = ({ data, viewData }: SourceSectionProps) => {
    const { source, threads } = viewData;

    const metadata = useContext(MetadataContext)!;
    const sourceInfo = metadata.sources[source.toLowerCase()];

    return (
        <div className="stack">
            <h2>
                {source}{' '}
                {sourceInfo && (
                    <span className="version">
                        ({formatVersion(sourceInfo.version)})
                    </span>
                )}
            </h2>
            {threads.map(thread => (
                <BaseNode
                    parents={[]}
                    node={new SourceThreadVirtualNode(data, thread)}
                    key={thread.name}
                />
            ))}
        </div>
    );
};

const OtherSourcesSection = ({ alreadyShown }: { alreadyShown: string[] }) => {
    const metadata = useContext(MetadataContext)!;
    if (!metadata.sources) {
        return null;
    }

    const otherSources = Object.values(metadata.sources)
        .filter(source => !alreadyShown.includes(source.name))
        .filter(p => !p.builtIn);

    if (!otherSources.length) {
        return null;
    }

    const sourceNoun = ['Fabric', 'Forge', 'NeoForge'].includes(
        metadata?.platform?.name!
    )
        ? 'mods'
        : 'plugins';

    return (
        <div className="other-sources">
            <h2>Other</h2>
            <p>
                The following other {sourceNoun} are installed, but didn&apos;t
                show up in this profile. Yay!
            </p>
            <ul>
                {otherSources.map(({ name, version }) => (
                    <li key={name}>
                        {name} <span>({formatVersion(version)})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
