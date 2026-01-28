import {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useState,
} from 'react';
import TextBox from '../../../../components/TextBox';
import FlatThreadVirtualNode from '../../node/FlatThreadVirtualNode';
import SamplerData from '../../SamplerData';
import { FlatViewData } from '../../worker/FlatViewGenerator';
import { LabelModeContext } from '../SamplerContext';
import BaseNode from '../tree/BaseNode';
import BottomUpButton from './button/BottomUpButton';
import LabelModeButton from './button/LabelModeButton';
import SelfTimeModeButton from './button/SelfTimeModeButton';
import FlatViewHeader from './header/FlatViewHeader';
import TopFunctionsButton from './button/TopFunctionsButton';
import TopFunctionsModal from '../modal/TopFunctionsModal';
import { getTopFunctions, TopFunction } from '../../utils/topFunctions';
import Panel from '../../../common/components/Panel';
import { useLanguage } from '../../../../i18n';

export const BottomUpContext = createContext(false);

import { View } from '../views/types';
import ViewSwitcher from './button/ViewSwitcher';
import { SamplerMetadata } from '../../../proto/spark_pb';

export interface FlatViewProps {
    data: SamplerData;
    viewData?: FlatViewData;
    setLabelMode: Dispatch<SetStateAction<boolean>>;
    view: View;
    setView: Dispatch<SetStateAction<View>>;
    sourcesViewSupported: boolean;
    metadata: SamplerMetadata;
}

// The sampler view in which the stack is flattened to the top x nodes
// according to total time or self time.
export default function FlatView({
    data,
    viewData,
    setLabelMode,
    view,
    setView,
    sourcesViewSupported,
    metadata
}: FlatViewProps) {
    const labelMode = useContext(LabelModeContext);
    const [bottomUp, setBottomUp] = useState(false);
    const [selfTimeMode, setSelfTimeMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topFunctions, setTopFunctions] = useState<TopFunction[]>([]);
    const { t } = useLanguage();

    const nodes = selfTimeMode
        ? viewData?.flatSelfTime
        : viewData?.flatTotalTime;

    return (
        <Panel
            className="flatview"
            title={t('viewer.functionList') || 'Function List'}
        >
            <FlatViewHeader>
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
                <BottomUpButton bottomUp={bottomUp} setBottomUp={setBottomUp} />
                <SelfTimeModeButton
                    selfTimeMode={selfTimeMode}
                    setSelfTimeMode={setSelfTimeMode}
                />
            </FlatViewHeader>

            {!nodes ? (
                <TextBox>Loading...</TextBox>
            ) : (
                <div className="stack">
                    <BottomUpContext.Provider value={bottomUp}>
                        {nodes.map(thread => (
                            <BaseNode
                                parents={[]}
                                node={new FlatThreadVirtualNode(data, thread)}
                                key={thread.name}
                            />
                        ))}
                    </BottomUpContext.Provider>
                </div>
            )}
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
        </Panel>
    );
}
