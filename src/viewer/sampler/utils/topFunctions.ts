import type { StackTraceNodeWithId } from '../../proto/nodes';
import type SamplerData from '../SamplerData';
import type VirtualNode from '../node/VirtualNode';
import BasicVirtualNode from '../node/BasicVirtualNode';

export interface TopFunction {
    node: VirtualNode;
    time: number;
    selfTime: number;
    percentage: number;
    name: string;
    className?: string;
    methodName?: string;
    source?: string;
}

/**
 * Get the top N functions by self time consumption
 * Self time = time spent in the function itself, excluding child calls
 * @param data SamplerData instance
 * @param limit Maximum number of functions to return (default: 20)
 * @returns Array of top functions sorted by self time (descending)
 */
export function getTopFunctions(
    data: SamplerData,
    limit: number = 20
): TopFunction[] {
    const stackTraceNodes = data.nodes.stackTraceNodes;
    const totalTime = data.threads.reduce((sum, thread) => sum + thread.time, 0);

    // Map nodes to TopFunction objects with self time calculation
    const functions: TopFunction[] = stackTraceNodes
        .filter(node => node.time > 0)
        .map(node => {
            const virtualNode = new BasicVirtualNode(data, node);
            const details = virtualNode.getDetails();

            // Calculate self time: total time - sum of children time
            const childrenTime = node.children.reduce((sum, child) => sum + child.time, 0);
            const selfTime = node.time - childrenTime;

            // Type guard: only StackTraceNodeDetails has className and methodName
            const name = details.type === 'stackTrace' && details.className && details.methodName
                ? `${details.className}.${details.methodName}`
                : details.type === 'stackTrace'
                    ? (details.className || details.methodName || 'Unknown')
                    : details.name || 'Unknown';

            return {
                node: virtualNode,
                time: node.time,
                selfTime,
                percentage: totalTime > 0 ? (selfTime / totalTime) * 100 : 0,
                name,
                className: details.type === 'stackTrace' ? details.className : undefined,
                methodName: details.type === 'stackTrace' ? details.methodName : undefined,
                source: data.sources.getSource(node.id),
            };
        })
        .filter(func => func.selfTime > 0); // Only include functions with positive self time

    // Sort by self time (descending) and take top N
    return functions
        .sort((a, b) => b.selfTime - a.selfTime)
        .slice(0, limit);
}
