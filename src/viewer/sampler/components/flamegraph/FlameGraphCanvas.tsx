import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../../../i18n';
import { SamplerMetadata, SamplerMetadata_SamplerMode } from '../../../proto/spark_pb';
import { TimeSelector } from '../../hooks/useTimeSelector';
import { MappingsResolver } from '../../mappings/resolver';
import VirtualNode from '../../node/VirtualNode';
import Panel from '../../../common/components/Panel';
import { formatBytesShort } from '../../../common/util/format';
import styles from './FlameGraphCanvas.module.scss';

export interface FlameGraphCanvasProps {
    flameData: VirtualNode;
    mappings: MappingsResolver;
    metadata: SamplerMetadata;
    timeSelector: TimeSelector;
}

interface FlameNode {
    name: string;
    value: number;
    children: FlameNode[];
    x: number;
    y: number;
    width: number;
    depth: number;
    percentage: number; // Percentage of total time
}

const ROW_HEIGHT = 24;
const PADDING = 2;
const MIN_WIDTH = 0.5;

export default function FlameGraphCanvas({
    flameData,
    mappings,
    metadata,
    timeSelector,
}: FlameGraphCanvasProps) {
    const { t } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [rootValue, setRootValue] = useState(0);

    const isAlloc = metadata.samplerMode === SamplerMetadata_SamplerMode.ALLOCATION;
    const getTimeFunction = timeSelector.getTime;

    // Convert VirtualNode to FlameNode structure
    const buildFlameData = (): { root: FlameNode; maxDepth: number } => {
        let maxDepth = 0;

        const convert = (node: VirtualNode, depth: number, totalValue: number): FlameNode => {
            maxDepth = Math.max(maxDepth, depth);
            const details = node.getDetails();
            let name = '';

            if (details.type === 'thread') {
                name = details.name;
            } else if (details.type === 'stackTrace') {
                const resolved = mappings.resolve(details);
                if (resolved.type === 'native') {
                    name = details.methodName + ' (native)';
                } else {
                    const { className, methodName } = resolved;
                    name = `${className}.${methodName}()`;
                }
            }

            const value = getTimeFunction(node);
            const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
            const children = node
                .getChildren()
                .sort((a, b) => getTimeFunction(b) - getTimeFunction(a))
                .map(child => convert(child, depth + 1, totalValue));

            return {
                name,
                value,
                children,
                x: 0,
                y: 0,
                width: 0,
                depth,
                percentage,
            };
        };

        const totalValue = getTimeFunction(flameData);
        setRootValue(totalValue);
        const root = convert(flameData, 0, totalValue);
        return { root, maxDepth };
    };

    // Layout flame graph nodes
    const layoutNodes = (root: FlameNode, totalWidth: number): void => {
        const layout = (node: FlameNode, x: number, width: number, y: number) => {
            node.x = x;
            node.y = y;
            node.width = width;

            let childX = x;
            const totalValue = node.children.reduce((sum, child) => sum + child.value, 0);

            node.children.forEach(child => {
                const childWidth = totalValue > 0 ? (child.value / totalValue) * width : 0;
                if (childWidth >= MIN_WIDTH) {
                    layout(child, childX, childWidth, y + ROW_HEIGHT);
                    childX += childWidth;
                }
            });
        };

        layout(root, 0, totalWidth, 0);
    };

    // Get color based on performance percentage (green to yellow to red)
    const getColor = (percentage: number): string => {
        // Clamp percentage between 0 and 100
        const p = Math.max(0, Math.min(100, percentage));

        if (p < 1) {
            // Very low usage - light blue/gray
            return '#7eb3d5';
        } else if (p < 5) {
            // Low usage - green
            return '#5cb85c';
        } else if (p < 15) {
            // Medium-low - yellow-green
            return '#8bc34a';
        } else if (p < 30) {
            // Medium - yellow
            return '#ffc107';
        } else if (p < 50) {
            // Medium-high - orange
            return '#ff9800';
        } else if (p < 75) {
            // High - deep orange
            return '#ff5722';
        } else {
            // Very high - red
            return '#f44336';
        }
    };

    // Draw flame graph
    const draw = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { root, maxDepth } = buildFlameData();
        const width = container.clientWidth;
        const height = (maxDepth + 1) * ROW_HEIGHT;

        if (width === 0 || height === 0) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        setDimensions({ width, height });
        layoutNodes(root, width);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw nodes
        const drawNode = (node: FlameNode) => {
            if (node.width < MIN_WIDTH) return;

            // Color based on percentage of total time
            ctx.fillStyle = getColor(node.percentage);
            ctx.fillRect(node.x, node.y, node.width, ROW_HEIGHT - PADDING);

            // Border
            ctx.strokeStyle = '#1a1d1f';
            ctx.lineWidth = 1;
            ctx.strokeRect(node.x, node.y, node.width, ROW_HEIGHT - PADDING);

            // Text
            if (node.width > 30) {
                ctx.fillStyle = '#000';
                ctx.font = '12px "JetBrains Mono", monospace';
                ctx.textBaseline = 'middle';

                const text = node.name;
                const textWidth = ctx.measureText(text).width;
                const maxTextWidth = node.width - 8;

                if (textWidth <= maxTextWidth) {
                    ctx.fillText(text, node.x + 4, node.y + (ROW_HEIGHT - PADDING) / 2);
                } else {
                    // Truncate text
                    let truncated = text;
                    while (ctx.measureText(truncated + '...').width > maxTextWidth && truncated.length > 0) {
                        truncated = truncated.slice(0, -1);
                    }
                    ctx.fillText(truncated + '...', node.x + 4, node.y + (ROW_HEIGHT - PADDING) / 2);
                }
            }

            node.children.forEach(drawNode);
        };

        drawNode(root);
    };

    // Handle mouse move for tooltip
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const { root } = buildFlameData();
        layoutNodes(root, dimensions.width);

        const findNode = (node: FlameNode): FlameNode | null => {
            if (
                x >= node.x &&
                x <= node.x + node.width &&
                y >= node.y &&
                y <= node.y + ROW_HEIGHT - PADDING
            ) {
                return node;
            }

            for (const child of node.children) {
                const found = findNode(child);
                if (found) return found;
            }

            return null;
        };

        const hoveredNode = findNode(root);
        if (hoveredNode) {
            const valueText = isAlloc
                ? formatBytesShort(hoveredNode.value)
                : `${hoveredNode.value}ms`;
            const percentText = `${hoveredNode.percentage.toFixed(2)}%`;
            setTooltip({
                x: e.clientX,
                y: e.clientY,
                text: `${hoveredNode.name}\n${valueText} (${percentText})`,
            });
        } else {
            setTooltip(null);
        }
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    useEffect(() => {
        // Initial draw
        const initialDraw = () => {
            requestAnimationFrame(() => {
                draw();
            });
        };
        initialDraw();

        const handleResize = () => {
            draw();
        };

        // Use ResizeObserver to detect container size changes
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => {
                draw();
            });
        });

        // Use MutationObserver to detect when parent becomes visible
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // Panel visibility might have changed, redraw after a short delay
                    setTimeout(() => {
                        const container = containerRef.current;
                        if (container && container.offsetParent !== null) {
                            // Container is visible
                            draw();
                        }
                    }, 100);
                }
            });
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
            // Observe the parent content div for class changes
            const contentDiv = containerRef.current.parentElement;
            if (contentDiv) {
                mutationObserver.observe(contentDiv, {
                    attributes: true,
                    attributeFilter: ['class'],
                });
            }
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flameData, mappings, metadata, timeSelector]);

    return (
        <Panel className="flame" title={t('viewer.flame.title') || 'Flame Graph'}>
            <div ref={containerRef} className={styles.container}>
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />
                {tooltip && (
                    <div
                        className={styles.tooltip}
                        style={{
                            left: tooltip.x + 10,
                            top: tooltip.y + 10,
                        }}
                    >
                        {tooltip.text.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                )}
            </div>
        </Panel>
    );
}
