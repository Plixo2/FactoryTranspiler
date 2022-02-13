import { IterableStream } from './iterable-stream';
import { Token, TokenType } from './tokenizer';

export class FactoryException extends Error {
    constructor(public stream: IterableStream<any>, text: string) {
        super(text);
    }
}

export class FactorySyntaxException extends FactoryException {
    constructor(stream: IterableStream<Token>, error: string) {
        super(stream, 'Failed to parse: ' + error);
    }
}

export class FactoryTokenException extends FactoryException {
    constructor(stream: IterableStream<Token>, type: Token | string, expected?: TokenType) {
        if (typeof type === 'string') {
            super(stream, 'Failed to parse Token: ' + type);
            return;
        }
        super(stream, `Expected ${TokenType[expected]} but found ${type == null ? 'none' : TokenType[type.type]}`);
    }
}

export class FactoryCharacterException extends FactoryException {
    constructor(stream: IterableStream<string>, error: string) {
        super(stream, error);
    }
}
