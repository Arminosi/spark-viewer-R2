import { faFire } from '@fortawesome/free-solid-svg-icons';
import { Dispatch, SetStateAction } from 'react';
import FaButton from '../../../../components/FaButton';
import BasicVirtualNode from '../../node/BasicVirtualNode';
import VirtualNode from '../../node/VirtualNode';
import SamplerData from '../../SamplerData';

export interface FlameButtonProps {
    data: SamplerData;
    setFlameData: Dispatch<SetStateAction<VirtualNode | undefined>>;
    flameData?: VirtualNode;
}

export default function FlameButton({ data, setFlameData, flameData }: FlameButtonProps) {
    if (data.threads.length !== 1) {
        return null;
    }

    function onClick() {
        if (flameData) {
            setFlameData(undefined);
        } else {
            setFlameData(new BasicVirtualNode(data, data.threads[0]));
        }
    }

    return (
        <FaButton
            icon={faFire}
            onClick={onClick}
            title="Toggle Flame Graph"
            extraClassName={flameData ? 'toggled' : undefined}
        />
    );
}
