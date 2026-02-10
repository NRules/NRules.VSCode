import * as assert from 'assert';
import { DebuggerProxy } from '../../debuggerProxy';

describe('DebuggerProxy', () => {
    const proxy = new DebuggerProxy();

    describe('getSchemaExpressions', () => {
        it('should return 3 expressions for the given session variable', () => {
            const expressions = (proxy as any).getSchemaExpressions('mySession');

            assert.strictEqual(expressions.length, 3);
            assert.ok(expressions[0].includes('mySession.GetSchema()'));
            assert.ok(expressions[1].includes('DgmlWriter'));
            assert.ok(expressions[2].includes('GetContents()'));
        });
    });

    describe('getPerformanceExpressions', () => {
        it('should return 4 expressions including metrics provider setup', () => {
            const expressions = (proxy as any).getPerformanceExpressions('mySession');

            assert.strictEqual(expressions.length, 4);
            assert.ok(expressions[0].includes('mySession.GetSchema()'));
            assert.ok(expressions[2].includes('SetMetricsProvider'));
            assert.ok(expressions[2].includes('mySession.Metrics'));
            assert.ok(expressions[3].includes('GetContents()'));
        });
    });
});
