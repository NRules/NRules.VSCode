import * as assert from 'assert';
import { evaluateExpression, EvaluationContext } from '../../dgmlExpressionEvaluator';

describe('DgmlExpressionEvaluator', () => {
    const emptyContext: EvaluationContext = { properties: {}, categories: [] };

    describe('arithmetic', () => {
        it('should evaluate simple numbers', () => {
            assert.strictEqual(evaluateExpression('42', emptyContext), 42);
        });

        it('should evaluate addition', () => {
            assert.strictEqual(evaluateExpression('1 + 2', emptyContext), 3);
        });

        it('should evaluate subtraction', () => {
            assert.strictEqual(evaluateExpression('10 - 3', emptyContext), 7);
        });

        it('should evaluate multiplication', () => {
            assert.strictEqual(evaluateExpression('4 * 5', emptyContext), 20);
        });

        it('should evaluate division', () => {
            assert.strictEqual(evaluateExpression('20 / 4', emptyContext), 5);
        });

        it('should respect operator precedence', () => {
            assert.strictEqual(evaluateExpression('2 + 3 * 4', emptyContext), 14);
        });

        it('should handle parentheses', () => {
            assert.strictEqual(evaluateExpression('(2 + 3) * 4', emptyContext), 20);
        });

        it('should handle unary minus', () => {
            assert.strictEqual(evaluateExpression('-5', emptyContext), -5);
        });

        it('should handle floating point', () => {
            assert.strictEqual(evaluateExpression('1.5 + 2.5', emptyContext), 4);
        });
    });

    describe('comparisons', () => {
        it('should evaluate greater than', () => {
            assert.strictEqual(evaluateExpression('5 > 3', emptyContext), true);
            assert.strictEqual(evaluateExpression('3 > 5', emptyContext), false);
        });

        it('should evaluate greater than or equal', () => {
            assert.strictEqual(evaluateExpression('5 >= 5', emptyContext), true);
            assert.strictEqual(evaluateExpression('4 >= 5', emptyContext), false);
        });

        it('should evaluate less than', () => {
            assert.strictEqual(evaluateExpression('3 < 5', emptyContext), true);
        });

        it('should evaluate less than or equal', () => {
            assert.strictEqual(evaluateExpression('5 <= 5', emptyContext), true);
        });

        it('should evaluate equality', () => {
            assert.strictEqual(evaluateExpression('5 == 5', emptyContext), true);
            assert.strictEqual(evaluateExpression('5 == 6', emptyContext), false);
        });

        it('should evaluate not equal', () => {
            assert.strictEqual(evaluateExpression('5 != 6', emptyContext), true);
            assert.strictEqual(evaluateExpression('5 != 5', emptyContext), false);
        });
    });

    describe('boolean operators', () => {
        it('should evaluate or', () => {
            assert.strictEqual(evaluateExpression('1 > 2 or 3 > 2', emptyContext), true);
            assert.strictEqual(evaluateExpression('1 > 2 or 3 > 4', emptyContext), false);
        });

        it('should evaluate and', () => {
            assert.strictEqual(evaluateExpression('1 < 2 and 3 < 4', emptyContext), true);
            assert.strictEqual(evaluateExpression('1 < 2 and 3 > 4', emptyContext), false);
        });

        it('should give and higher precedence than or', () => {
            // true or (false and false) = true
            assert.strictEqual(evaluateExpression('1 < 2 or 3 > 4 and 5 > 6', emptyContext), true);
        });
    });

    describe('Math functions', () => {
        it('should evaluate Math.Min', () => {
            assert.strictEqual(evaluateExpression('Math.Min(3, 7)', emptyContext), 3);
        });

        it('should evaluate Math.Max', () => {
            assert.strictEqual(evaluateExpression('Math.Max(3, 7)', emptyContext), 7);
        });

        it('should evaluate Math.Log', () => {
            const result = evaluateExpression('Math.Log(8, 2)', emptyContext) as number;
            assert.ok(Math.abs(result - 3) < 0.001);
        });

        it('should evaluate Math.Abs', () => {
            assert.strictEqual(evaluateExpression('Math.Abs(-5)', emptyContext), 5);
        });

        it('should handle nested Math calls', () => {
            assert.strictEqual(evaluateExpression('Math.Min(25, Math.Max(1, 10))', emptyContext), 10);
        });
    });

    describe('Color.FromRgb', () => {
        it('should produce rgb string', () => {
            assert.strictEqual(evaluateExpression("Color.FromRgb(255, 128, 0)", emptyContext), 'rgb(255,128,0)');
        });

        it('should clamp values to 0-255', () => {
            assert.strictEqual(evaluateExpression("Color.FromRgb(300, -10, 128)", emptyContext), 'rgb(255,0,128)');
        });

        it('should round fractional values', () => {
            assert.strictEqual(evaluateExpression("Color.FromRgb(200, 100.7, 50.3)", emptyContext), 'rgb(200,101,50)');
        });
    });

    describe('HasCategory', () => {
        it('should return true when category matches', () => {
            const ctx: EvaluationContext = { properties: {}, categories: ['Rule', 'Type'] };
            assert.strictEqual(evaluateExpression("HasCategory('Rule')", ctx), true);
        });

        it('should return false when category does not match', () => {
            const ctx: EvaluationContext = { properties: {}, categories: ['Type'] };
            assert.strictEqual(evaluateExpression("HasCategory('Rule')", ctx), false);
        });

        it('should work with or for multiple categories', () => {
            const ctx: EvaluationContext = { properties: {}, categories: ['BetaMemory'] };
            assert.strictEqual(evaluateExpression("HasCategory('AlphaMemory') or HasCategory('BetaMemory')", ctx), true);
        });
    });

    describe('property access', () => {
        it('should resolve properties from context', () => {
            const ctx: EvaluationContext = { properties: { 'PerfCount': '100' }, categories: [] };
            assert.strictEqual(evaluateExpression('PerfCount > 50', ctx), true);
        });

        it('should return 0 for missing properties', () => {
            assert.strictEqual(evaluateExpression('MissingProp', emptyContext), 0);
        });

        it('should resolve Source.Property for links', () => {
            const ctx: EvaluationContext = {
                properties: {},
                categories: [],
                sourceProperties: { 'PerfTotalOutputCount': '500' },
            };
            assert.strictEqual(evaluateExpression('Source.PerfTotalOutputCount > 0', ctx), true);
        });

        it('should resolve Target.Property for links', () => {
            const ctx: EvaluationContext = {
                properties: {},
                categories: [],
                targetProperties: { 'PerfCount': '10' },
            };
            assert.strictEqual(evaluateExpression('Target.PerfCount', ctx), 10);
        });
    });

    describe('complex expressions from rule-graph.dgml', () => {
        it('should evaluate link stroke thickness expression', () => {
            const ctx: EvaluationContext = {
                properties: {},
                categories: [],
                sourceProperties: { 'PerfTotalOutputCount': '375750' },
            };
            const result = evaluateExpression(
                'Math.Min(25,Math.Max(1,Math.Log(Source.PerfTotalOutputCount,2)))',
                ctx
            ) as number;
            assert.ok(result > 1 && result <= 25);
        });

        it('should evaluate font size expression for memory nodes', () => {
            const ctx: EvaluationContext = {
                properties: { 'PerfElementCount': '500' },
                categories: ['AlphaMemory'],
            };
            const result = evaluateExpression(
                'Math.Min(72,Math.Max(8,8+4*Math.Log(PerfElementCount,2)))',
                ctx
            ) as number;
            assert.ok(result >= 8 && result <= 72);
        });

        it('should evaluate heat-map background color expression', () => {
            const ctx: EvaluationContext = {
                properties: { 'PerfTotalDurationMilliseconds': '1000' },
                categories: [],
            };
            const result = evaluateExpression(
                'Color.FromRgb(200,(200*(1765-PerfTotalDurationMilliseconds))/1765,(200*(1765-PerfTotalDurationMilliseconds))/1765)',
                ctx
            ) as string;
            assert.ok(result.startsWith('rgb('));
            assert.strictEqual(result, 'rgb(200,87,87)');
        });
    });
});
