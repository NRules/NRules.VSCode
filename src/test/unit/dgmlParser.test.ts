import * as assert from 'assert';
import { DgmlParser } from '../../dgmlParser';

describe('DgmlParser', () => {
    const parser = new DgmlParser();

    it('should parse a valid DGML string into nodes, links, and title', async () => {
        const xml = `<?xml version="1.0" encoding="utf-8"?>
            <DirectedGraph Title="Test Graph">
                <Nodes>
                    <Node Id="N1" Label="Node 1" Category="Rule" />
                    <Node Id="N2" Label="Node 2" />
                </Nodes>
                <Links>
                    <Link Source="N1" Target="N2" Category="Contains" />
                </Links>
            </DirectedGraph>`;

        const result = await parser.parse(xml);
        const graph = result.DirectedGraph;

        assert.strictEqual(graph.$.Title, 'Test Graph');
        assert.strictEqual(graph.Nodes[0].Node.length, 2);
        assert.strictEqual(graph.Nodes[0].Node[0].$.Id, 'N1');
        assert.strictEqual(graph.Nodes[0].Node[0].$.Label, 'Node 1');
        assert.strictEqual(graph.Nodes[0].Node[0].$.Category, 'Rule');
        assert.strictEqual(graph.Nodes[0].Node[1].$.Id, 'N2');
        assert.strictEqual(graph.Links[0].Link.length, 1);
        assert.strictEqual(graph.Links[0].Link[0].$.Source, 'N1');
        assert.strictEqual(graph.Links[0].Link[0].$.Target, 'N2');
        assert.strictEqual(graph.Links[0].Link[0].$.Category, 'Contains');
    });

    it('should parse DGML with empty nodes and links', async () => {
        const xml = `<?xml version="1.0" encoding="utf-8"?>
            <DirectedGraph Title="Empty Graph">
                <Nodes />
                <Links />
            </DirectedGraph>`;

        const result = await parser.parse(xml);
        const graph = result.DirectedGraph;

        assert.strictEqual(graph.$.Title, 'Empty Graph');
        assert.strictEqual(graph.Nodes[0].Node, undefined);
        assert.strictEqual(graph.Links[0].Link, undefined);
    });

    it('should reject malformed XML', async () => {
        const xml = `<DirectedGraph><Nodes><Node Id="N1"`;

        await assert.rejects(() => parser.parse(xml));
    });
});
