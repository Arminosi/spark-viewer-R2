import {
    faBackwardStep,
    faForwardStep,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import {
    WorldStatistics_Region,
    WorldStatistics_World,
} from '../../../../proto/spark_pb';
import { useLanguage } from '../../../../../i18n';
import ChunkCountsList from './ChunkCountsList';
import EntityCountsList from './EntityCountsList';

interface Region extends WorldStatistics_Region {
    world: string;
}

export interface WorldRegionSummaryProps {
    worlds: WorldStatistics_World[];
}

export default function WorldRegionSummary({
    worlds,
}: WorldRegionSummaryProps) {
    const { t } = useLanguage();
    const regions = useMemo(() => {
        const regions: Region[] = [];
        for (const world of worlds) {
            for (const worldRegion of world.regions) {
                const region: Region = { ...worldRegion, world: world.name };
                region.chunks.sort((a, b) => b.totalEntities - a.totalEntities);
                regions.push(region);
            }
        }
        regions.sort((a, b) => b.totalEntities - a.totalEntities);
        return regions;
    }, [worlds]);

    const [regionIdx, setRegionIdx] = useState(0);

    const region = useMemo(() => regions[regionIdx], [regions, regionIdx]);

    const combinedEntities = useMemo(() => {
        const combinedEntities: Record<string, number> = {};
        for (const chunk of region.chunks) {
            for (const [name, count] of Object.entries(chunk.entityCounts)) {
                if (!combinedEntities[name]) {
                    combinedEntities[name] = 0;
                }
                combinedEntities[name] += count;
            }
        }
        return combinedEntities;
    }, [region]);

    function previous() {
        setRegionIdx(prev => (prev - 1 + regions.length) % regions.length);
    }

    function next() {
        setRegionIdx(prev => (prev + 1) % regions.length);
    }

    return (
        <div className="region-view">
            <div className="header region-selector">
                <div className="button" onClick={previous} title={t('viewer.world.previous')}>
                    <FontAwesomeIcon icon={faBackwardStep} />
                </div>
                <span>
                    {t('viewer.world.region')} #{regionIdx + 1} ({t('viewer.world.of')} {regions.length})
                </span>
                <div className="button" onClick={next} title={t('viewer.world.next')}>
                    <FontAwesomeIcon icon={faForwardStep} />
                </div>
            </div>
            <div className="detail-lists">
                <div>
                    <h3>
                        {t('viewer.world.entities')} (<span>{region.totalEntities}</span>):
                    </h3>
                    <EntityCountsList entityCounts={combinedEntities} />
                </div>
                <div>
                    <h3>
                        World: {region.world}
                    </h3>
                    <br />
                    <h3>
                        {t('viewer.world.chunks')} (<span>{region.chunks.length}</span>):
                    </h3>
                    <ChunkCountsList chunks={region.chunks} />
                </div>
            </div>
        </div>
    );
}
