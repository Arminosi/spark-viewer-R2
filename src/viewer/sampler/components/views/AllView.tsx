import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
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

    const initialCheckDone = useRef(false);

    useEffect(() => {
        if (!initialCheckDone.current) {
            initialCheckDone.current = true;
            if (highlighted.isEmpty()) {
                const functions = getTopFunctions(data, 1);
                if (functions.length > 0) {
                    const top = functions[0];
                    highlighted.replace(top.node);

                    const idVal = top.node.getId();
                    const id = `node-${Array.isArray(idVal) ? (idVal as number[]).join('-') : String(idVal)}`;

                    const tryScroll = (attempt = 0) => {
                        const el = document.getElementById(id);
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else if (attempt < 20) {
                            setTimeout(() => tryScroll(attempt + 1), 100);
                        }
                    };
                    // Wait a bit for the tree expansion to render
                    setTimeout(() => tryScroll(), 200);
                }
            }
        }
    }, [data, highlighted]);

    function handleOpenModal() {
        const functions = getTopFunctions(data, 20);
        setTopFunctions(functions);
        setIsModalOpen(true);
    }

    function handleFunctionClick(func: TopFunction) {
        // The modal will handle highlighting and closing.
        // Wait a short moment for the tree to auto-expand, then scroll to the node.
        const idVal = func.node.getId();
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
                data={data}
            />
        </div>
    );
}
