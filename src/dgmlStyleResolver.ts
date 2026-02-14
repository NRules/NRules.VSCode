import { DirectedGraph, Node, Link, DgmlStyle } from './dgml';
import { evaluateExpression, EvaluationContext } from './dgmlExpressionEvaluator';

export type CytoscapeStyleMap = Record<string, string | number>;

const defaultCategoryColors: Record<string, { background: string; border: string; color: string }> = {
    'Root': { background: '#808080', border: '#606060', color: '#fff' },
    'Type': { background: '#ffa500', border: '#cc8400', color: '#fff' },
    'Selection': { background: '#0000cc', border: '#000099', color: '#fff' },
    'AlphaMemory': { background: '#ff0000', border: '#cc0000', color: '#fff' },
    'Join': { background: '#000080', border: '#000060', color: '#fff' },
    'BetaMemory': { background: '#008000', border: '#006400', color: '#fff' },
    'Aggregate': { background: '#8b0000', border: '#600000', color: '#fff' },
    'Binding': { background: '#87ceeb', border: '#5f9ea0', color: '#222' },
    'Rule': { background: '#800080', border: '#600060', color: '#fff' },
};

const namedColors: Record<string, string> = {
    'black': '#000000',
    'white': '#ffffff',
    'red': '#ff0000',
    'green': '#008000',
    'blue': '#0000ff',
    'gray': '#808080',
    'grey': '#808080',
    'orange': '#ffa500',
    'purple': '#800080',
    'yellow': '#ffff00',
};

function resolveColor(value: string): string {
    if (value.startsWith('#') || value.startsWith('rgb')) {
        return value;
    }
    return namedColors[value.toLowerCase()] ?? value;
}

const nodeDgmlToCytoscape: Record<string, string> = {
    'Background': 'background-color',
    'Foreground': 'color',
    'FontSize': 'font-size',
    'StrokeThickness': 'border-width',
    'Stroke': 'border-color',
};

const linkDgmlToCytoscape: Record<string, string[]> = {
    'StrokeThickness': ['width'],
    'Stroke': ['line-color', 'target-arrow-color'],
};

function mapSetterToNode(property: string, value: string | number): Record<string, string | number> {
    const cyProp = nodeDgmlToCytoscape[property];
    if (!cyProp) {
        return {};
    }
    if (property === 'FontSize') {
        return { [cyProp]: typeof value === 'number' ? `${Math.round(value)}px` : `${value}px` };
    }
    if (property === 'Background' || property === 'Foreground' || property === 'Stroke') {
        return { [cyProp]: resolveColor(String(value)) };
    }
    return { [cyProp]: value };
}

function mapSetterToLink(property: string, value: string | number): Record<string, string | number> {
    const cyProps = linkDgmlToCytoscape[property];
    if (!cyProps) {
        return {};
    }
    const result: Record<string, string | number> = {};
    for (const cyProp of cyProps) {
        if (property === 'Stroke') {
            result[cyProp] = resolveColor(String(value));
        } else {
            result[cyProp] = value;
        }
    }
    return result;
}

function buildNodeContext(node: Node): EvaluationContext {
    return {
        properties: node.$ as Record<string, string | undefined>,
        categories: node.$.Category ? [node.$.Category] : [],
    };
}

function buildLinkContext(link: Link, nodeMap: Map<string, Node>): EvaluationContext {
    const sourceNode = nodeMap.get(link.$.Source);
    const targetNode = nodeMap.get(link.$.Target);
    return {
        properties: link.$ as Record<string, string | undefined>,
        categories: link.$.Category ? [link.$.Category] : [],
        sourceProperties: sourceNode ? sourceNode.$ as Record<string, string | undefined> : {},
        targetProperties: targetNode ? targetNode.$ as Record<string, string | undefined> : {},
    };
}

function evaluateConditions(style: DgmlStyle, context: EvaluationContext): boolean {
    if (!style.Condition || style.Condition.length === 0) {
        return true;
    }
    return style.Condition.every(cond => {
        const result = evaluateExpression(cond.$.Expression, context);
        return Boolean(result);
    });
}

function applySetters(
    style: DgmlStyle,
    context: EvaluationContext,
    computed: CytoscapeStyleMap,
    mapFn: (prop: string, value: string | number) => Record<string, string | number>
): void {
    if (!style.Setter) {
        return;
    }
    for (const setter of style.Setter) {
        const property = setter.$.Property;
        let value: string | number;
        if (setter.$.Expression) {
            const result = evaluateExpression(setter.$.Expression, context);
            value = typeof result === 'boolean' ? (result ? 1 : 0) : result;
        } else if (setter.$.Value !== undefined) {
            value = setter.$.Value;
        } else {
            continue;
        }

        const mapped = mapFn(property, value);
        for (const [cyProp, cyVal] of Object.entries(mapped)) {
            // First-match-wins: only set if not already set
            if (!(cyProp in computed)) {
                computed[cyProp] = cyVal;
            }
        }
    }
}

export class DgmlStyleResolver {
    resolve(graph: DirectedGraph): {
        nodeStyles: Map<string, CytoscapeStyleMap>;
        linkStyles: Map<string, CytoscapeStyleMap>;
    } {
        const nodeStyles = new Map<string, CytoscapeStyleMap>();
        const linkStyles = new Map<string, CytoscapeStyleMap>();

        const nodeMap = new Map<string, Node>();
        if (graph.Nodes?.[0]?.Node) {
            for (const node of graph.Nodes[0].Node) {
                nodeMap.set(node.$.Id, node);
            }
        }

        const hasStyles = graph.Styles?.[0]?.Style && graph.Styles[0].Style.length > 0;

        if (hasStyles) {
            const styles = graph.Styles![0].Style;
            const nodeStyleList = styles.filter(s => s.$.TargetType === 'Node');
            const linkStyleList = styles.filter(s => s.$.TargetType === 'Link');

            if (graph.Nodes?.[0]?.Node) {
                for (const node of graph.Nodes[0].Node) {
                    const context = buildNodeContext(node);
                    const computed: CytoscapeStyleMap = {};
                    for (const style of nodeStyleList) {
                        if (evaluateConditions(style, context)) {
                            applySetters(style, context, computed, mapSetterToNode);
                        }
                    }
                    if (Object.keys(computed).length > 0) {
                        nodeStyles.set(node.$.Id, computed);
                    }
                }
            }

            if (graph.Links?.[0]?.Link) {
                for (const link of graph.Links[0].Link) {
                    const linkId = `${link.$.Source}-${link.$.Target}`;
                    const context = buildLinkContext(link, nodeMap);
                    const computed: CytoscapeStyleMap = {};
                    for (const style of linkStyleList) {
                        if (evaluateConditions(style, context)) {
                            applySetters(style, context, computed, mapSetterToLink);
                        }
                    }
                    if (Object.keys(computed).length > 0) {
                        linkStyles.set(linkId, computed);
                    }
                }
            }
        } else {
            // Fallback: apply default category colors when no <Styles> section
            if (graph.Nodes?.[0]?.Node) {
                for (const node of graph.Nodes[0].Node) {
                    const category = node.$.Category;
                    if (category && defaultCategoryColors[category]) {
                        const colors = defaultCategoryColors[category];
                        nodeStyles.set(node.$.Id, {
                            'background-color': colors.background,
                            'border-color': colors.border,
                            'color': colors.color,
                        });
                    }
                }
            }
        }

        return { nodeStyles, linkStyles };
    }
}
