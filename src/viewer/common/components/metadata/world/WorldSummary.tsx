import { WorldStatistics as WorldStatisticsProto } from '../../../../proto/spark_pb';
import { useLanguage } from '../../../../../i18n';
import EntityCountsList from './EntityCountsList';
import WorldTotalChunks from './WorldTotalChunks';
import WorldTotalEntities from './WorldTotalEntities';

export interface WorldSummaryProps {
    worldStatistics: WorldStatisticsProto;
}

export default function WorldSummary({ worldStatistics }: WorldSummaryProps) {
    const { t } = useLanguage();
    return (
        <div>
            <div className="header">{t('viewer.world.summary')}</div>
            <div className="detail-lists">
                <div>
                    <WorldTotalEntities
                        totalEntities={worldStatistics.totalEntities}
                        worlds={worldStatistics.worlds}
                    />
                    <WorldTotalChunks worldsInput={worldStatistics.worlds} />
                </div>
                <div>
                    <h3>
                        {t('viewer.world.entityCounts')}:
                    </h3>
                    <EntityCountsList
                        entityCounts={worldStatistics.entityCounts}
                    />
                </div>
            </div>
        </div>
    );
}
