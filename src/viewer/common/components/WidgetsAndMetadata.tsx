import classNames from 'classnames';
import styles from '../../../style/metadata.module.scss';
import { SparkMetadata } from '../../proto/guards';
import { MetadataToggle } from '../../common/hooks/useMetadataToggle';
import MetadataDetail from './metadata/MetadataDetail';
import Widgets from './widgets/Widgets';

export interface WidgetsAndMetadataProps {
    metadata: SparkMetadata;
    metadataToggle: MetadataToggle;
    graph?: React.ReactNode;
}

export default function WidgetsAndMetadata({
    metadata,
    metadataToggle,
    graph,
}: WidgetsAndMetadataProps) {
    return (
        <div
            className={classNames(styles.metadata, {
                expanded: metadataToggle.showMetadata,
            })}
            style={{ display: metadataToggle.showMetadata ? undefined : 'none' }}
        >
            <div className={styles['metadata-grid']}>
                <div className={styles['widgets-column']}>
                    {!!metadata.platformStatistics && (
                        <Widgets
                            metadata={metadata}
                            expanded={metadataToggle.showMetadata}
                        />
                    )}
                </div>

                <div className={styles['metadata-column']}>
                    {!!metadata.platform && metadataToggle.showMetadata && (
                        <MetadataDetail metadata={metadata} />
                    )}
                </div>

                {graph && (
                    <div className={styles['graph-column']}>
                        {graph}
                    </div>
                )}
            </div>
        </div>
    );
}
