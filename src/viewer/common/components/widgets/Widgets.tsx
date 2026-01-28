import classNames from 'classnames';
import styles from '../../../../style/widgets.module.scss';
import { SparkMetadata } from '../../../proto/guards';
import { useLanguage } from '../../../../i18n';
import Panel from '../Panel';
import TpsWidget from './types/TpsWidget';
import MsptWidget from './types/MsptWidget';
import PingWidget from './types/PingWidget';
import CpuWidget from './types/CpuWidget';
import MemoryWidget from './types/MemoryWidget';
import DiskWidget from './types/DiskWidget';
import GcWidget from './types/GcWidget';

export interface WidgetsProps {
    metadata: SparkMetadata;
    expanded: boolean;
}

export default function Widgets({ metadata, expanded }: WidgetsProps) {
    const platform = metadata.platformStatistics!;
    const system = metadata.systemStatistics!;
    const { t } = useLanguage();

    return (
        <Panel title={t('viewer.widgets.systemDetails') || 'System Details'} defaultExpanded={expanded}>
            <div
                className={classNames(styles.widgets, 'widgets')}
                data-hide={!expanded}
            >
                {/* Performance Group */}
                <div className="widget-group">
                    <h3>{t('viewer.widgets.performance') || 'Performance'}</h3>
                    <div className="group-content">
                        {platform.tps && <TpsWidget tps={platform.tps} />}
                        {platform.mspt && <MsptWidget mspt={platform.mspt} />}
                        {platform.ping && <PingWidget ping={platform.ping} />}
                    </div>
                </div>

                {/* CPU Group */}
                <div className="widget-group">
                    <h3>{t('viewer.widgets.cpu') || 'CPU'}</h3>
                    <div className="group-content">
                        <CpuWidget cpu={system.cpu!.processUsage!} label="process" />
                        <CpuWidget cpu={system.cpu!.systemUsage!} label="system" />
                        <DiskWidget disk={system.disk!} />
                    </div>
                </div>

                {/* Memory Group */}
                <div className="widget-group">
                    <h3>{t('viewer.widgets.memory') || 'Memory'}</h3>
                    <div className="group-content">
                        <MemoryWidget memory={platform.memory!.heap!} label="process" />
                        <MemoryWidget memory={system.memory!.physical!} label="physical" />
                        <MemoryWidget memory={system.memory!.swap!} label="swap" />
                    </div>
                </div>

                {/* GC Group */}
                {(!!Object.keys(platform.gc).length || !!Object.keys(system.gc).length) && (
                    <div className="widget-group">
                        <h3>{t('viewer.widgets.gc') || 'Garbage Collection'}</h3>
                        <div className="group-content">
                            {Object.entries(platform.gc).map(([label, data]) => (
                                <GcWidget
                                    key={label}
                                    gc={data}
                                    title="during"
                                    label={label}
                                />
                            ))}
                            {Object.entries(system.gc).map(([label, data]) => (
                                <GcWidget
                                    key={'system ' + label}
                                    gc={data}
                                    title="all"
                                    label={label}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Panel>
    );
}
