import { Dispatch, SetStateAction, useContext, useState } from 'react';
import BasicVirtualNode from '../../node/BasicVirtualNode';
import SamplerData from '../../SamplerData';
import { HighlightedContext, LabelModeContext } from '../SamplerContext';
import BaseNode from '../tree/BaseNode';
import LabelModeButton from './button/LabelModeButton';
import TopFunctionsButton from './button/TopFunctionsButton';
import TopFunctionsModal from '../modal/TopFunctionsModal';
import { getTopFunctions, TopFunction } from '../../utils/topFunctions';
import AllViewHeader from './header/AllViewHeader';

export interface AllViewProps {
    data: SamplerData;
    setLabelMode: Dispatch<SetStateAction<boolean>>;
}

// The sampler view in which all data is shown in one, single stack.
export default function AllView({ data, setLabelMode }: AllViewProps) {
    const labelMode = useContext(LabelModeContext);
    const highlighted = useContext(HighlightedContext)!;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topFunctions, setTopFunctions] = useState<TopFunction[]>([]);

    function handleOpenModal() {
        const functions = getTopFunctions(data, 20);
        setTopFunctions(functions);
        setIsModalOpen(true);
    }

    function handleFunctionClick(func: TopFunction) {
        // The modal will handle highlighting and closing
        // Here we just need to scroll to the node if needed
        // The tree will auto-expand because the node is highlighted
    }

    return (
        <div className="allview">
            <AllViewHeader>
                <LabelModeButton
                    labelMode={labelMode}
                    setLabelMode={setLabelMode}
                />
                <TopFunctionsButton onClick={handleOpenModal} />
            </AllViewHeader>
            <hr />
            <div className="stack">
                {data.threads.map(thread => (
                    <BaseNode
                        parents={[]}
                        node={new BasicVirtualNode(data, thread)}
                        key={thread.name}
                    />
                ))}
            </div>
            <TopFunctionsModal
                topFunctions={topFunctions}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onFunctionClick={handleFunctionClick}
            />
        </div>
    );
}
