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

export const BottomUpContext = createContext(false);

export interface FlatViewProps {
    data: SamplerData;
    viewData?: FlatViewData;
    setLabelMode: Dispatch<SetStateAction<boolean>>;
}

// The sampler view in which the stack is flattened to the top x nodes
// according to total time or self time.
export default function FlatView({
    data,
    viewData,
    setLabelMode,
}: FlatViewProps) {
    const labelMode = useContext(LabelModeContext);
    const [bottomUp, setBottomUp] = useState(false);
    const [selfTimeMode, setSelfTimeMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topFunctions, setTopFunctions] = useState<TopFunction[]>([]);

    const view = selfTimeMode
        ? viewData?.flatSelfTime
        : viewData?.flatTotalTime;

    return (
        <div className="flatview">
            <FlatViewHeader>
                <LabelModeButton
                    labelMode={labelMode}
                    setLabelMode={setLabelMode}
                />
                <BottomUpButton bottomUp={bottomUp} setBottomUp={setBottomUp} />
                <SelfTimeModeButton
                    selfTimeMode={selfTimeMode}
                    setSelfTimeMode={setSelfTimeMode}
                />
                <TopFunctionsButton onClick={() => {
                    const functions = getTopFunctions(data, 20);
                    setTopFunctions(functions);
                    setIsModalOpen(true);
                }} />
            </FlatViewHeader>
            <hr />
            {!view ? (
                <TextBox>Loading...</TextBox>
            ) : (
                <div className="stack">
                    <BottomUpContext.Provider value={bottomUp}>
                        {view.map(thread => (
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
        </div>
    );
}
