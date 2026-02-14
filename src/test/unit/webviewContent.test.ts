import * as assert from 'assert';
import { WebviewContentProvider } from '../../webviewContent';
import { DirectedGraph } from '../../dgml';

function createProvider(): WebviewContentProvider {
    const mockWebview = {
        asWebviewUri: (uri: any) => uri,
    };
    const mockUri = '/ext';
    return new WebviewContentProvider(mockWebview as any, mockUri as any);
}

function makeGraph(nodes: any[], links: any[], title: string = 'Test'): DirectedGraph {
    return {
        $: { Title: title },
        Nodes: [{ Node: nodes }],
        Links: [{ Link: links }],
    };
}

describe('WebviewContentProvider', () => {
    const provider = createProvider();

    describe('getCytoscapeElements', () => {
        it('should convert nodes and links to Cytoscape elements', () => {
            const graph = makeGraph(
                [
                    { $: { Id: 'N1', Label: 'Node 1', Category: 'Rule' } },
                    { $: { Id: 'N2', Label: 'Node 2' } },
                ],
                [
                    { $: { Source: 'N1', Target: 'N2', Category: 'Contains' } },
                ]
            );

            const elements = (provider as any).getCytoscapeElements(graph);

            assert.strictEqual(elements.length, 3);
            assert.strictEqual(elements[0].data.id, 'N1');
            assert.strictEqual(elements[0].data.label, 'Node 1');
            assert.strictEqual(elements[0].data.category, 'Rule');
            assert.strictEqual(elements[1].data.id, 'N2');
            assert.strictEqual(elements[2].data.id, 'N1-N2');
            assert.strictEqual(elements[2].data.source, 'N1');
            assert.strictEqual(elements[2].data.target, 'N2');
        });

        it('should fall back label to Category when Label is absent', () => {
            const graph = makeGraph(
                [{ $: { Id: 'N1', Category: 'Rule' } }],
                []
            );

            const elements = (provider as any).getCytoscapeElements(graph);

            assert.strictEqual(elements[0].data.label, 'Rule');
        });

        it('should fall back label to Id when both Label and Category are absent', () => {
            const graph = makeGraph(
                [{ $: { Id: 'N1' } }],
                []
            );

            const elements = (provider as any).getCytoscapeElements(graph);

            assert.strictEqual(elements[0].data.label, 'N1');
        });

        it('should handle an empty graph', () => {
            const graph: DirectedGraph = {
                $: { Title: 'Empty' },
                Nodes: [{}] as any,
                Links: [{}] as any,
            };

            const elements = (provider as any).getCytoscapeElements(graph);

            assert.strictEqual(elements.length, 0);
        });

        it('should truncate labels longer than 80 characters', () => {
            const longLabel = 'L'.repeat(90);
            const graph = makeGraph(
                [{ $: { Id: 'N1', Label: longLabel } }],
                []
            );

            const elements = (provider as any).getCytoscapeElements(graph);
            const label = elements[0].data.label;

            assert.strictEqual(label.length, 80);
            assert.strictEqual(label.endsWith('…'), true);
        });
    });

    describe('getErrorContent', () => {
        it('should include the error message in the HTML', () => {
            const html = provider.getErrorContent('Something went wrong');

            assert.ok(html.includes('Something went wrong'));
            assert.ok(html.includes('<h1>Error</h1>'));
        });
    });

    describe('getHtmlContent', () => {
        it('should include the graph title in the HTML', () => {
            const graph = makeGraph([], [], 'My Graph');
            const html = provider.getHtmlContent(graph);

            assert.ok(html.includes('My Graph'));
        });
    });
});
