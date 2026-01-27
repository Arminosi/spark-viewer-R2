import { WorldStatistics_World } from '../../../../proto/spark_pb';
import { useLanguage } from '../../../../../i18n';

export interface WorldTotalEntitiesProps {
    totalEntities: number;
    worlds: WorldStatistics_World[];
}

export default function WorldTotalEntities({
    totalEntities,
    worlds,
}: WorldTotalEntitiesProps) {
    const { t } = useLanguage();
    return (
        <>
            <p>
                <b>{t('viewer.world.entities')}</b> ({t('viewer.world.total')}): <span>{totalEntities}</span>
            </p>
            <ul>
                {worlds
                    .sort((a, b) => b.totalEntities - a.totalEntities)
                    .map(world => (
                        <li key={world.name}>
                            {world.name}: <span>{world.totalEntities}</span>
                        </li>
                    ))}
            </ul>
        </>
    );
}
