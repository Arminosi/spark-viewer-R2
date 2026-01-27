import useToggle from './useToggle';

export interface MetadataToggle {
    showMetadata: boolean;
    toggleMetadata: () => void;
}

export default function useMetadataToggle(): MetadataToggle {
    const [showMetadata, , toggleMetadata] = useToggle(
        'prefShowMetadata',
        true
    );

    return { showMetadata, toggleMetadata };
}

export function useAlwaysOpenMetadataToggle(): MetadataToggle {
    return {
        showMetadata: true,
        toggleMetadata: () => {},
    };
}
