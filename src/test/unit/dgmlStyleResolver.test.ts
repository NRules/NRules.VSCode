import * as assert from 'assert';
import { DgmlStyleResolver } from '../../dgmlStyleResolver';
import { DirectedGraph } from '../../dgml';

describe('DgmlStyleResolver', () => {
    const resolver = new DgmlStyleResolver();

    function makeGraph(overrides: Partial<DirectedGraph>): DirectedGraph {
        return {
            $: { Title: 'Test' },
            Nodes: [{ Node: [] }],
            Links: [{ Link: [] }],
            ...overrides,
        };
    }

    describe('fallback behavior', () => {
        it('should apply default category colors when no Styles section exists', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', Category: 'Rule' } },
                    { $: { Id: 'n2', Category: 'Type' } },
                    { $: { Id: 'n3' } },
                ] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.deepStrictEqual(nodeStyles.get('n1'), {
                'background-color': '#800080',
                'border-color': '#600060',
                'color': '#fff',
            });
            assert.deepStrictEqual(nodeStyles.get('n2'), {
                'background-color': '#ffa500',
                'border-color': '#cc8400',
                'color': '#fff',
            });
            assert.strictEqual(nodeStyles.has('n3'), false);
        });
    });

    describe('style resolution with conditions', () => {
        it('should apply styles when condition matches', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', Category: 'Rule' } },
                ] }],
                Styles: [{ Style: [
                    {
                        $: { TargetType: 'Node' },
                        Condition: [{ $: { Expression: "HasCategory('Rule')" } }],
                        Setter: [{ $: { Property: 'Background', Value: '#ff0000' } }],
                    },
                ] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.deepStrictEqual(nodeStyles.get('n1'), { 'background-color': '#ff0000' });
        });

        it('should not apply styles when condition does not match', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', Category: 'Type' } },
                ] }],
                Styles: [{ Style: [
                    {
                        $: { TargetType: 'Node' },
                        Condition: [{ $: { Expression: "HasCategory('Rule')" } }],
                        Setter: [{ $: { Property: 'Background', Value: '#ff0000' } }],
                    },
                ] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.strictEqual(nodeStyles.has('n1'), false);
        });

        it('should require all conditions to match (AND semantics)', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', Category: 'AlphaMemory', PerfElementCount: '100' } },
                    { $: { Id: 'n2', Category: 'AlphaMemory', PerfElementCount: '0' } },
                ] }],
                Styles: [{ Style: [
                    {
                        $: { TargetType: 'Node' },
                        Condition: [
                            { $: { Expression: "HasCategory('AlphaMemory') or HasCategory('BetaMemory')" } },
                            { $: { Expression: 'PerfElementCount > 0' } },
                        ],
                        Setter: [{ $: { Property: 'FontSize', Expression: '20' } }],
                    },
                ] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.deepStrictEqual(nodeStyles.get('n1'), { 'font-size': '20px' });
            assert.strictEqual(nodeStyles.has('n2'), false);
        });
    });

    describe('first-match-wins precedence', () => {
        it('should keep the first matched value per property', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', PerfTotalDurationMilliseconds: '100' } },
                ] }],
                Styles: [{ Style: [
                    {
                        $: { TargetType: 'Node' },
                        Condition: [{ $: { Expression: 'PerfTotalDurationMilliseconds > 0' } }],
                        Setter: [{ $: { Property: 'Background', Value: '#ff0000' } }],
                    },
                    {
                        $: { TargetType: 'Node' },
                        Setter: [{ $: { Property: 'Background', Value: '#00ff00' } }],
                    },
                ] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.strictEqual(nodeStyles.get('n1')!['background-color'], '#ff0000');
        });

        it('should allow different properties from different styles', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', PerfTotalDurationMilliseconds: '100' } },
                ] }],
                Styles: [{ Style: [
                    {
                        $: { TargetType: 'Node' },
                        Condition: [{ $: { Expression: 'PerfTotalDurationMilliseconds > 0' } }],
                        Setter: [{ $: { Property: 'Background', Value: '#ff0000' } }],
                    },
                    {
                        $: { TargetType: 'Node' },
                        Setter: [{ $: { Property: 'Foreground', Value: 'Black' } }],
                    },
                ] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.strictEqual(nodeStyles.get('n1')!['background-color'], '#ff0000');
            assert.strictEqual(nodeStyles.get('n1')!['color'], '#000000');
        });
    });

    describe('property mapping', () => {
        it('should map Background to background-color', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [{ $: { Id: 'n1' } }] }],
                Styles: [{ Style: [{
                    $: { TargetType: 'Node' },
                    Setter: [{ $: { Property: 'Background', Value: '#abc' } }],
                }] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.strictEqual(nodeStyles.get('n1')!['background-color'], '#abc');
        });

        it('should map Foreground to color and resolve named colors', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [{ $: { Id: 'n1' } }] }],
                Styles: [{ Style: [{
                    $: { TargetType: 'Node' },
                    Setter: [{ $: { Property: 'Foreground', Value: 'Black' } }],
                }] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.strictEqual(nodeStyles.get('n1')!['color'], '#000000');
        });

        it('should map FontSize to font-size with px suffix', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [{ $: { Id: 'n1' } }] }],
                Styles: [{ Style: [{
                    $: { TargetType: 'Node' },
                    Setter: [{ $: { Property: 'FontSize', Expression: '16' } }],
                }] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.strictEqual(nodeStyles.get('n1')!['font-size'], '16px');
        });

        it('should map link StrokeThickness to width', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', PerfTotalOutputCount: '100' } },
                    { $: { Id: 'n2' } },
                ] }],
                Links: [{ Link: [{ $: { Source: 'n1', Target: 'n2' } }] }],
                Styles: [{ Style: [{
                    $: { TargetType: 'Link' },
                    Setter: [{ $: { Property: 'StrokeThickness', Expression: '5' } }],
                }] }],
            });

            const { linkStyles } = resolver.resolve(graph);
            assert.strictEqual(linkStyles.get('n1-n2')!['width'], 5);
        });

        it('should map link Stroke to line-color and target-arrow-color', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1' } },
                    { $: { Id: 'n2' } },
                ] }],
                Links: [{ Link: [{ $: { Source: 'n1', Target: 'n2' } }] }],
                Styles: [{ Style: [{
                    $: { TargetType: 'Link' },
                    Setter: [{ $: { Property: 'Stroke', Value: 'Red' } }],
                }] }],
            });

            const { linkStyles } = resolver.resolve(graph);
            assert.strictEqual(linkStyles.get('n1-n2')!['line-color'], '#ff0000');
            assert.strictEqual(linkStyles.get('n1-n2')!['target-arrow-color'], '#ff0000');
        });
    });

    describe('link styles with Source property access', () => {
        it('should evaluate Source.Property in link conditions', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', PerfTotalOutputCount: '500' } },
                    { $: { Id: 'n2' } },
                ] }],
                Links: [{ Link: [{ $: { Source: 'n1', Target: 'n2' } }] }],
                Styles: [{ Style: [{
                    $: { TargetType: 'Link' },
                    Condition: [{ $: { Expression: 'Source.PerfTotalOutputCount > 0' } }],
                    Setter: [{ $: { Property: 'StrokeThickness', Expression: 'Math.Min(25,Math.Max(1,Math.Log(Source.PerfTotalOutputCount,2)))' } }],
                }] }],
            });

            const { linkStyles } = resolver.resolve(graph);
            const width = linkStyles.get('n1-n2')!['width'] as number;
            assert.ok(width > 1 && width <= 25);
        });
    });

    describe('expression-based setters', () => {
        it('should evaluate Color.FromRgb in setter expressions', () => {
            const graph = makeGraph({
                Nodes: [{ Node: [
                    { $: { Id: 'n1', PerfTotalDurationMilliseconds: '1000' } },
                ] }],
                Styles: [{ Style: [{
                    $: { TargetType: 'Node' },
                    Condition: [{ $: { Expression: 'PerfTotalDurationMilliseconds > 0' } }],
                    Setter: [
                        { $: { Property: 'Foreground', Value: 'Black' } },
                        { $: { Property: 'Background', Expression: 'Color.FromRgb(200,(200*(1765-PerfTotalDurationMilliseconds))/1765,(200*(1765-PerfTotalDurationMilliseconds))/1765)' } },
                    ],
                }] }],
            });

            const { nodeStyles } = resolver.resolve(graph);
            assert.strictEqual(nodeStyles.get('n1')!['color'], '#000000');
            assert.strictEqual(nodeStyles.get('n1')!['background-color'], 'rgb(200,87,87)');
        });
    });
});
