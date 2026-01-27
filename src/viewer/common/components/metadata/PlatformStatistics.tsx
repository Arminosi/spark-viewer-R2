import {
    PlatformMetadata,
    PlatformStatistics as PlatformStatisticsProto,
    SamplerMetadata_SamplerEngine,
    SystemStatistics as SystemStatisticsProto,
} from '../../../proto/spark_pb';
import { useLanguage } from '../../../../i18n';
import { formatDuration, formatDurationLocalized } from '../../util/format';

export interface PlatformStatisticsProps {
    platform: PlatformMetadata;
    platformStatistics: PlatformStatisticsProto;
    systemStatistics?: SystemStatisticsProto;
    platformType: string;
    onlineMode?: string;
    runningTime?: number;
    numberOfTicks?: number;
    numberOfIncludedTicks?: number;
    engine?: SamplerMetadata_SamplerEngine;
}

export default function PlatformStatistics({
    platform,
    platformStatistics,
    systemStatistics,
    platformType,
    onlineMode,
    runningTime,
    numberOfTicks,
    numberOfIncludedTicks,
    engine,
}: PlatformStatisticsProps) {
    const { t } = useLanguage();
    return (
        <>
            <p>
                {t(`platformStats.${platformType === 'application' ? 'systemIs' : 'platformIs'}`)}{' '}
                <span>{platform.brand || platform.name}</span> {platformType}{' '}
                {t('platformStats.running')} {platformType === 'application' ? t('platformStats.sparkVersion') : ''} {t('platformStats.version')}
                &quot;
                <span>{platform.version}</span>&quot;.
            </p>
            {platform.minecraftVersion && (
                <p>
                    {t('platformStats.minecraftVersion')} &quot;
                    <span>{platform.minecraftVersion}</span>&quot;.
                </p>
            )}
            {onlineMode && (
                <p>
                    {platformType} {t('platformStats.isRunningIn')} <span>{onlineMode}</span>.
                </p>
            )}
            {platformStatistics?.playerCount > 0 && (
                <p>
                    {platformType} {t('platformStats.playerCount')}{' '}
                    <span>{platformStatistics.playerCount}</span> {t('platformStats.playersOnline')}.
                </p>
            )}
            {!!systemStatistics && (
                <SystemStatistics systemStatistics={systemStatistics} />
            )}
            {runningTime && (
                <p>
                    {t('platformStats.profilerWasRunning')}{' '}
                    {engine ? (
                        <>
                            ({t('platformStats.engine')}{' '}
                            <span>
                                {engine == SamplerMetadata_SamplerEngine.ASYNC
                                    ? 'async'
                                    : 'java'}
                            </span>
                            ){' '}
                        </>
                    ) : (
                        ''
                    )}
                    {t('platformStats.wasRunningFor')} <span>{formatDurationLocalized(runningTime, t)}</span>
                    {!!numberOfTicks && (
                        <>
                            {' '}
                            (<span>{numberOfTicks}</span> {t('platformStats.ticks')})
                        </>
                    )}
                    .
                    {!!numberOfIncludedTicks && (
                        <>
                            {' '}
                            <span>{numberOfIncludedTicks}</span> {t('platformStats.ticksExceeded')}.
                        </>
                    )}
                </p>
            )}
        </>
    );
}

interface SystemStatisticsProps {
    systemStatistics: SystemStatisticsProto;
}

const SystemStatistics = ({ systemStatistics }: SystemStatisticsProps) => {
    const { t } = useLanguage();
    return (
        <>
            <p>
                {t('platformStats.systemIsRunning')} <span>{systemStatistics.os!.name}</span> (
                <span>{systemStatistics.os!.arch}</span>) {t('platformStats.version2')} &quot;
                <span>{systemStatistics.os!.version}</span>&quot; {t('platformStats.andHas')}{' '}
                <span>{systemStatistics.cpu!.threads}</span> {t('platformStats.cpuThreadsAvailable')}.
            </p>
            {systemStatistics.cpu!.modelName && (
                <p>
                    {t('platformStats.cpuDescribed')}{' '}
                    <span>{systemStatistics.cpu!.modelName}</span>.
                </p>
            )}
            <p>
                {t('platformStats.processUsing')}{' '}
                <span>{systemStatistics.java!.version}</span> (
                <span>{systemStatistics.java!.vendorVersion}</span> {t('platformStats.from')}{' '}
                <span>{systemStatistics.java!.vendor}</span>).
                {systemStatistics.jvm?.name && (
                    <>
                        {' '}
                        {t('platformStats.jvmIs')} <span>{systemStatistics.jvm?.name}</span>.
                    </>
                )}
            </p>
            <p>
                {t('platformStats.currentProcessUptime')}{' '}
                <span>{formatDurationLocalized(systemStatistics.uptime, t)}</span>.
            </p>
        </>
    );
};
