import { DomObject, StringBuilder } from './dom-object';
import { FactoryCharacterException, FactoryTokenException } from './exceptions';
import { IterableStream } from './iterable-stream';
import { createSyntaxTree } from './lexer';
import { createTokenStream, IterableSkipableStream, IterableTokenStream, Token, TokenType } from './tokenizer';

export function getTokenitzerResult(data: string, debug: boolean = false): FactoryTokenizerResult {
    const result = compile(data, false, false, debug);

    return {
        error: result.error,
        tokens: result.tokens,
    };
}
export function getLexerResult(data: string, debug: boolean = false): FactoryLexerResult {
    const result = compile(data, false, true, debug);
    return {
        error: result.error,
        ast: result.ast,
        tokens: result.tokens,
    };
}

export function getBuilderResult(data: string, debug: boolean = false): FactoryBuilderResult {
    const result = compile(data, true, true, debug);
    return {
        domElements: result.domElements,
        error: result.error,
        ast: result.ast,
        tokens: result.tokens,
    };
}

function compile(
    data: string,
    builder: boolean,
    lexer: boolean,
    debug: boolean = false
): {
    domElements?: string;
    tokens?: IterableSkipableStream<Token>;
    error?: FactoryError;
    ast?: DomObject;
} {
    let error: FactoryError = undefined;
    let domContent: string = undefined;
    let tokens: IterableTokenStream = undefined;
    let ast: DomObject = undefined;
    try {
        tokens = createTokenStream(data);
        ast = createSyntaxTree(tokens);
        domContent = ast.buildElement();
        if (debug) {
            const builder: StringBuilder = new StringBuilder();
            ast.buildTreeModel(builder, '', '');
        }
    } catch (exception) {
        if (exception instanceof FactoryTokenException) {
            const factoryException: FactoryTokenException = exception;
            let lines = '';
            let line = '';
            let lineIndex = 1;
            for (let i = 0; i < factoryException.stream.index(); i++) {
                if (factoryException.stream.entries[i].type == TokenType.EOL) {
                    lines += line + '\n';
                    line = '';
                    lineIndex += 1;
                } else {
                    line += factoryException.stream.entries[i].data;
                }
            }
            lines += line + '<--- Here';

            error = {
                line: lineIndex,
                column: line.length,
                errorString: lines,
            };
        } else if (exception instanceof FactoryCharacterException) {
            const factoryException: FactoryCharacterException = exception;
            let lines = '';
            let line = '';
            let lineIndex = 1;
            for (let i = 0; i < factoryException.stream.index(); i++) {
                if (factoryException.stream.entries[i] == '\n') {
                    lines += line + '\n';
                    line = '';
                    lineIndex += 1;
                } else {
                    line += factoryException.stream.entries[i];
                }
            }
            lines += line + '<--- Here';

            error = {
                line: lineIndex,
                column: line.length,
                errorString: lines,
            };
        } else {
            error = {
                line: -1,
                column: -1,
                errorString: exception.toString(),
            };
        }
    }

    return {
        tokens: tokens,
        domElements: domContent,
        ast: ast,
        error: error,
    };
}

export interface FactoryBuilderResult {
    domElements?: string;
    tokens?: IterableSkipableStream<Token>;
    ast: DomObject;
    error?: FactoryError;
}

export interface FactoryTokenizerResult {
    tokens?: IterableSkipableStream<Token>;
    error?: FactoryError;
}
export interface FactoryLexerResult {
    tokens?: IterableSkipableStream<Token>;
    ast?: DomObject;
    error?: FactoryError;
}

export interface FactoryError {
    line: number;
    column: number;
    errorString: string;
}
