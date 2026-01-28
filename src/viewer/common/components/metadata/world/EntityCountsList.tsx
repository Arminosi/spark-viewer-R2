import React, { Suspense } from 'react';

const MinecraftIcon = React.lazy(
    () => import('../../../../../components/MinecraftIcon')
);

export interface EntityCountsListProps {
    entityCounts: Record<string, number>;
}

export default function EntityCountsList({
    entityCounts,
}: EntityCountsListProps) {
    const entries = Object.entries(entityCounts).sort((a, b) => b[1] - a[1]);
    const entriesToDisplay = entries.slice(0, 15);

    return (
        <ul>
            {entriesToDisplay.map(([name, count]) => {
                if (name.startsWith('minecraft:')) {
                    name = name.substring('minecraft:'.length);
                }
                return (
                    <li key={name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Suspense fallback={<span style={{ width: 16, height: 16, display: 'inline-block' }} />}>
                                <MinecraftIcon name={name} />
                            </Suspense>
                            <span>{name}:</span>
                        </div>
                        <span style={{ color: '#fff' }}>{count}</span>
                    </li>
                );
            })}
        </ul>
    );
}
