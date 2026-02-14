export interface EvaluationContext {
    properties: Record<string, string | undefined>;
    categories: string[];
    sourceProperties?: Record<string, string | undefined>;
    targetProperties?: Record<string, string | undefined>;
}

const enum TokenType {
    Number,
    String,
    Identifier,
    Dot,
    LeftParen,
    RightParen,
    Comma,
    Plus,
    Minus,
    Star,
    Slash,
    Greater,
    GreaterEqual,
    Less,
    LessEqual,
    EqualEqual,
    NotEqual,
    Or,
    And,
    Not,
    Eof,
}

interface Token {
    type: TokenType;
    value: string;
}

function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
        const ch = input[i];

        if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
            i++;
            continue;
        }

        if (ch === '(') { tokens.push({ type: TokenType.LeftParen, value: '(' }); i++; continue; }
        if (ch === ')') { tokens.push({ type: TokenType.RightParen, value: ')' }); i++; continue; }
        if (ch === ',') { tokens.push({ type: TokenType.Comma, value: ',' }); i++; continue; }
        if (ch === '+') { tokens.push({ type: TokenType.Plus, value: '+' }); i++; continue; }
        if (ch === '-') { tokens.push({ type: TokenType.Minus, value: '-' }); i++; continue; }
        if (ch === '*') { tokens.push({ type: TokenType.Star, value: '*' }); i++; continue; }
        if (ch === '/') { tokens.push({ type: TokenType.Slash, value: '/' }); i++; continue; }
        if (ch === '.') { tokens.push({ type: TokenType.Dot, value: '.' }); i++; continue; }

        if (ch === '>' && input[i + 1] === '=') {
            tokens.push({ type: TokenType.GreaterEqual, value: '>=' }); i += 2; continue;
        }
        if (ch === '>') { tokens.push({ type: TokenType.Greater, value: '>' }); i++; continue; }
        if (ch === '<' && input[i + 1] === '=') {
            tokens.push({ type: TokenType.LessEqual, value: '<=' }); i += 2; continue;
        }
        if (ch === '<') { tokens.push({ type: TokenType.Less, value: '<' }); i++; continue; }
        if (ch === '=' && input[i + 1] === '=') {
            tokens.push({ type: TokenType.EqualEqual, value: '==' }); i += 2; continue;
        }
        if (ch === '!' && input[i + 1] === '=') {
            tokens.push({ type: TokenType.NotEqual, value: '!=' }); i += 2; continue;
        }

        if (ch === '\'' || ch === '"') {
            const quote = ch;
            i++;
            let str = '';
            while (i < input.length && input[i] !== quote) {
                str += input[i];
                i++;
            }
            i++; // skip closing quote
            tokens.push({ type: TokenType.String, value: str });
            continue;
        }

        if (ch >= '0' && ch <= '9') {
            let num = '';
            while (i < input.length && ((input[i] >= '0' && input[i] <= '9') || input[i] === '.')) {
                num += input[i];
                i++;
            }
            tokens.push({ type: TokenType.Number, value: num });
            continue;
        }

        if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
            let ident = '';
            while (i < input.length && ((input[i] >= 'a' && input[i] <= 'z') || (input[i] >= 'A' && input[i] <= 'Z') || (input[i] >= '0' && input[i] <= '9') || input[i] === '_')) {
                ident += input[i];
                i++;
            }
            if (ident === 'or') {
                tokens.push({ type: TokenType.Or, value: 'or' });
            } else if (ident === 'and') {
                tokens.push({ type: TokenType.And, value: 'and' });
            } else if (ident === 'not') {
                tokens.push({ type: TokenType.Not, value: 'not' });
            } else {
                tokens.push({ type: TokenType.Identifier, value: ident });
            }
            continue;
        }

        throw new Error(`Unexpected character '${ch}' at position ${i}`);
    }

    tokens.push({ type: TokenType.Eof, value: '' });
    return tokens;
}

class Parser {
    private pos = 0;

    constructor(private tokens: Token[], private context: EvaluationContext) {}

    private peek(): Token {
        return this.tokens[this.pos];
    }

    private advance(): Token {
        const token = this.tokens[this.pos];
        this.pos++;
        return token;
    }

    private expect(type: TokenType): Token {
        const token = this.peek();
        if (token.type !== type) {
            throw new Error(`Expected token type ${type}, got ${token.type} ('${token.value}')`);
        }
        return this.advance();
    }

    public parseExpression(): number | string | boolean {
        return this.parseOr();
    }

    private parseOr(): number | string | boolean {
        let left = this.parseAnd();
        while (this.peek().type === TokenType.Or) {
            this.advance();
            const right = this.parseAnd();
            left = Boolean(left) || Boolean(right);
        }
        return left;
    }

    private parseAnd(): number | string | boolean {
        let left = this.parseComparison();
        while (this.peek().type === TokenType.And) {
            this.advance();
            const right = this.parseComparison();
            left = Boolean(left) && Boolean(right);
        }
        return left;
    }

    private parseComparison(): number | string | boolean {
        let left = this.parseAdditive();
        const token = this.peek();
        if (token.type === TokenType.Greater || token.type === TokenType.GreaterEqual ||
            token.type === TokenType.Less || token.type === TokenType.LessEqual ||
            token.type === TokenType.EqualEqual || token.type === TokenType.NotEqual) {
            this.advance();
            const right = this.parseAdditive();
            const l = Number(left);
            const r = Number(right);
            switch (token.type) {
                case TokenType.Greater: return l > r;
                case TokenType.GreaterEqual: return l >= r;
                case TokenType.Less: return l < r;
                case TokenType.LessEqual: return l <= r;
                case TokenType.EqualEqual: return l === r;
                case TokenType.NotEqual: return l !== r;
            }
        }
        return left;
    }

    private parseAdditive(): number | string | boolean {
        let left = this.parseMultiplicative();
        while (this.peek().type === TokenType.Plus || this.peek().type === TokenType.Minus) {
            const op = this.advance();
            const right = this.parseMultiplicative();
            if (op.type === TokenType.Plus) {
                left = Number(left) + Number(right);
            } else {
                left = Number(left) - Number(right);
            }
        }
        return left;
    }

    private parseMultiplicative(): number | string | boolean {
        let left = this.parseUnary();
        while (this.peek().type === TokenType.Star || this.peek().type === TokenType.Slash) {
            const op = this.advance();
            const right = this.parseUnary();
            if (op.type === TokenType.Star) {
                left = Number(left) * Number(right);
            } else {
                left = Number(left) / Number(right);
            }
        }
        return left;
    }

    private parseUnary(): number | string | boolean {
        if (this.peek().type === TokenType.Minus) {
            this.advance();
            const val = this.parseUnary();
            return -Number(val);
        }
        if (this.peek().type === TokenType.Not) {
            this.advance();
            const val = this.parseUnary();
            return !val;
        }
        return this.parsePrimary();
    }

    private parsePrimary(): number | string | boolean {
        const token = this.peek();

        if (token.type === TokenType.Number) {
            this.advance();
            return parseFloat(token.value);
        }

        if (token.type === TokenType.String) {
            this.advance();
            return token.value;
        }

        if (token.type === TokenType.LeftParen) {
            this.advance();
            const val = this.parseExpression();
            this.expect(TokenType.RightParen);
            return val;
        }

        if (token.type === TokenType.Identifier) {
            return this.parseIdentifier();
        }

        throw new Error(`Unexpected token '${token.value}' (type ${token.type})`);
    }

    private parseIdentifier(): number | string | boolean {
        const name = this.advance().value;

        // Check for function call: identifier(...)
        if (this.peek().type === TokenType.LeftParen) {
            return this.parseFunctionCall(name);
        }

        // Check for dotted access: identifier.identifier(...)
        if (this.peek().type === TokenType.Dot) {
            this.advance(); // consume dot
            const member = this.expect(TokenType.Identifier).value;

            // Math.Fn(...) or Color.Fn(...)
            if (this.peek().type === TokenType.LeftParen) {
                return this.parseFunctionCall(name + '.' + member);
            }

            // Source.Property or Target.Property
            if (name === 'Source') {
                return this.resolveProperty(member, this.context.sourceProperties ?? {});
            }
            if (name === 'Target') {
                return this.resolveProperty(member, this.context.targetProperties ?? {});
            }

            throw new Error(`Unknown object '${name}' for member access`);
        }

        // Simple function without parens — treat as property reference
        return this.resolveProperty(name, this.context.properties);
    }

    private parseFunctionCall(name: string): number | string | boolean {
        this.expect(TokenType.LeftParen);
        const args: (number | string | boolean)[] = [];
        if (this.peek().type !== TokenType.RightParen) {
            args.push(this.parseExpression());
            while (this.peek().type === TokenType.Comma) {
                this.advance();
                args.push(this.parseExpression());
            }
        }
        this.expect(TokenType.RightParen);

        return this.callFunction(name, args);
    }

    private callFunction(name: string, args: (number | string | boolean)[]): number | string | boolean {
        switch (name) {
            case 'HasCategory': {
                const catName = String(args[0]);
                return this.context.categories.includes(catName);
            }
            case 'Math.Min':
                return Math.min(Number(args[0]), Number(args[1]));
            case 'Math.Max':
                return Math.max(Number(args[0]), Number(args[1]));
            case 'Math.Log':
                return Math.log(Number(args[0])) / Math.log(Number(args[1]));
            case 'Math.Abs':
                return Math.abs(Number(args[0]));
            case 'Color.FromRgb': {
                const r = Math.round(Math.max(0, Math.min(255, Number(args[0]))));
                const g = Math.round(Math.max(0, Math.min(255, Number(args[1]))));
                const b = Math.round(Math.max(0, Math.min(255, Number(args[2]))));
                return `rgb(${r},${g},${b})`;
            }
            default:
                throw new Error(`Unknown function '${name}'`);
        }
    }

    private resolveProperty(name: string, props: Record<string, string | undefined>): number | string {
        const value = props[name];
        if (value === undefined) {
            return 0;
        }
        const num = Number(value);
        if (!isNaN(num)) {
            return num;
        }
        return value;
    }
}

export function evaluateExpression(expression: string, context: EvaluationContext): number | string | boolean {
    const tokens = tokenize(expression);
    const parser = new Parser(tokens, context);
    return parser.parseExpression();
}
