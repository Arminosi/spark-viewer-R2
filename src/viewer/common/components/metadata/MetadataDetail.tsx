import { useMemo, useState } from 'react';
import { SparkMetadata } from '../../../proto/guards';
import { PlatformMetadata_Type } from '../../../proto/spark_pb';
import {
    detectOnlineMode,
    objectMap,
    unwrapSamplerMetadata,
} from '../../util/metadata';
import { useLanguage } from '../../../../i18n';
import ExtraPlatformMetadata from './ExtraPlatformMetadata';
import GameRules from './GameRules';
import JvmStartupArgs from './JvmStartupArgs';
import MemoryStatistics from './MemoryStatistics';
import NetworkStatistics from './NetworkStatistics';
import PlatformStatistics from './PlatformStatistics';
import PluginsModsList from './PluginsModsList';
import ServerConfigurations from './ServerConfigurations';
import WorldStatistics from './WorldStatistics';
import Panel from '../Panel';

interface MetadataDetailProps {
    metadata: SparkMetadata;
}

export default function MetadataDetail({ metadata }: MetadataDetailProps) {
    const { t } = useLanguage();
    const {
        platform,
        platformStatistics,
        systemStatistics,
        serverConfigurations,
        extraPlatformMetadata,
    } = metadata;
    const platformType = PlatformMetadata_Type[platform!.type].toLowerCase();

    const { parsedConfigurations, onlineMode } = useMemo(() => {
        let parsedConfigurations: Record<string, any> | undefined;
        let onlineMode: string | undefined;

        if (serverConfigurations && Object.keys(serverConfigurations).length) {
            parsedConfigurations = objectMap(serverConfigurations, v =>
                JSON.parse(v)
            );
        }

        try {
            onlineMode = detectOnlineMode(
                platformStatistics?.onlineMode,
                parsedConfigurations
            );
        } catch (e) {
            // ignore
        }
        return { parsedConfigurations, onlineMode };
    }, [serverConfigurations, platformStatistics]);

    const parsedExtraMetadata = useMemo(() => {
        if (
            extraPlatformMetadata &&
            Object.keys(extraPlatformMetadata).length
        ) {
            return objectMap(extraPlatformMetadata, v => JSON.parse(v));
        }
    }, [extraPlatformMetadata]);

    const { runningTime, numberOfTicks, numberOfIncludedTicks, samplerEngine } =
        unwrapSamplerMetadata(metadata);

    const [view, setView] = useState(
        !!platformStatistics?.world &&
            !!platformStatistics?.world?.totalEntities
            ? t('viewer.metadataTabs.world')
            : t('viewer.metadataTabs.platform')
    );
    const views: Record<string, () => boolean> = {
        [t('viewer.metadataTabs.platform')]: () => true,
        [t('viewer.metadataTabs.memory')]: () =>
            !!platformStatistics?.memory?.heap ||
            !!platformStatistics?.memory?.pools?.length,
        [t('viewer.metadataTabs.jvmFlags')]: () => !!systemStatistics?.java?.vmArgs,
        [t('viewer.metadataTabs.configurations')]: () => !!parsedConfigurations,
        [t('viewer.metadataTabs.world')]: () =>
            !!platformStatistics?.world &&
            !!platformStatistics?.world?.totalEntities,
        [t('viewer.metadataTabs.misc')]: () => !!parsedExtraMetadata,
        [t('viewer.metadataTabs.pluginsMods')]: () =>
            !!platformStatistics?.world?.dataPacks.length ||
            !!Object.keys(metadata.sources).length,
        [t('viewer.metadataTabs.network')]: () => !!Object.keys(systemStatistics?.net ?? {}).length,
        [t('viewer.metadataTabs.gameRules')]: () => !!platformStatistics?.world?.gameRules.length,
    };

    return (
        <Panel title={t('viewer.metadata.title') || 'Server Metadata'} defaultExpanded={false}>
            <div className="textbox metadata-detail">
                <div className="metadata-detail-controls">
                    {Object.entries(views).map(([name, func]) => {
                        return (
                            !!func() && (
                                <div
                                    key={name}
                                    onClick={() => setView(name)}
                                    className={
                                        view === name ? 'toggled' : undefined
                                    }
                                >
                                    {name}
                                </div>
                            )
                        );
                    })}
                </div>

                <div className="metadata-detail-content">
                    {view === t('viewer.metadataTabs.platform') ? (
                        <PlatformStatistics
                            platform={platform!}
                            platformStatistics={platformStatistics!}
                            systemStatistics={systemStatistics}
                            platformType={platformType}
                            onlineMode={onlineMode}
                            runningTime={runningTime}
                            numberOfTicks={numberOfTicks}
                            numberOfIncludedTicks={numberOfIncludedTicks}
                            engine={samplerEngine}
                        />
                    ) : view === t('viewer.metadataTabs.memory') ? (
                        <MemoryStatistics
                            memory={platformStatistics?.memory!}
                            gc={platformStatistics?.gc!}
                        />
                    ) : view === t('viewer.metadataTabs.network') ? (
                        <NetworkStatistics systemStatistics={systemStatistics!} />
                    ) : view === t('viewer.metadataTabs.jvmFlags') ? (
                        <JvmStartupArgs systemStatistics={systemStatistics!} />
                    ) : view === t('viewer.metadataTabs.configurations') ? (
                        <ServerConfigurations
                            parsedConfigurations={parsedConfigurations!}
                        />
                    ) : view === t('viewer.metadataTabs.world') ? (
                        <WorldStatistics
                            worldStatistics={platformStatistics!.world!}
                        />
                    ) : view === t('viewer.metadataTabs.gameRules') ? (
                        <GameRules
                            gameRules={platformStatistics?.world?.gameRules!}
                        />
                    ) : view === t('viewer.metadataTabs.pluginsMods') ? (
                        <PluginsModsList
                            plugins={Object.values(metadata.sources || {})}
                            dataPacks={platformStatistics?.world?.dataPacks || []}
                        />
                    ) : view === t('viewer.metadataTabs.misc') ? (
                        <ExtraPlatformMetadata data={parsedExtraMetadata!} />
                    ) : (
                        <p>Unknown view.</p>
                    )}
                </div>
            </div>
        </Panel>
    );
}
