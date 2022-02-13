import { IterableStream } from './iterable-stream';
import os = require('os');
import { FactoryCharacterException } from './exceptions';

export enum TokenType {
    TAG,
    ATTRIBUTE,
    STRING,
    PARENTHESES_OPEN,
    PARENTHESES_CLOSED,
    BRACES_OPEN,
    BRACES_CLOSED,
    BRACKET_OPEN,
    BRACKET_CLOSED,
    ASSIGN,
    ASTERISK,
    EOL,
    WHITESPACE,
}
export interface Token {
    type: TokenType;
    data: string;
    start: number;
    end: number;
}

export function createTokenStream(input: string): IterableStream<Token> {
    const tokens: Token[] = [];

    let line: number = 0;
    input.split(os.EOL).forEach((lineString) => {
        tokens.push(...createLineTokens(line, lineString));
        line += 1;
    });
    return new IterableStream(tokens);
}

function createLineTokens(line: number, input: string): Token[] {
    const tokens: Token[] = [];
    const chars = Array.from(input);

    const stream = new IterableStream<string>(chars);
    let lastContentAt = 0;

    while (stream.hasEntriesLeft()) {
        const character: string | undefined = stream.step();

        if (!character) {
            continue;
        }

        if (character.trim().length === 0) {
            tokens.push({
                type: TokenType.WHITESPACE,
                start: lastContentAt,
                end: stream.index(),
                data: ' ',
            });
        } else if (/[A-Za-z]/.test(character)) {
            tokens.push({
                type: TokenType.TAG,
                start: lastContentAt,
                data: buildTag(stream),
                end: stream.index(),
            });
        } else
            switch (character) {
                case '(':
                    tokens.push({
                        type: TokenType.PARENTHESES_OPEN,
                        start: lastContentAt,
                        data: '(',
                        end: stream.index(),
                    });
                    break;
                case ')':
                    tokens.push({
                        type: TokenType.PARENTHESES_CLOSED,
                        start: lastContentAt,
                        data: ')',
                        end: stream.index(),
                    });
                    break;
                case '{':
                    tokens.push({
                        type: TokenType.BRACES_OPEN,
                        start: lastContentAt,
                        end: stream.index(),
                        data: '{',
                    });
                    break;
                case '}':
                    tokens.push({
                        type: TokenType.BRACES_CLOSED,
                        start: lastContentAt,
                        end: stream.index(),
                        data: '}',
                    });
                    break;
                case '[':
                    tokens.push({
                        type: TokenType.BRACES_OPEN,
                        start: lastContentAt,
                        data: '[',
                        end: stream.index(),
                    });
                    break;
                case ']':
                    tokens.push({
                        type: TokenType.BRACES_CLOSED,
                        start: lastContentAt,
                        data: ']',
                        end: stream.index(),
                    });
                    break;
                case '"':
                    tokens.push({
                        type: TokenType.STRING,
                        start: lastContentAt,
                        data: '"' + buildString(stream) + '"',
                        end: stream.index(),
                    });
                    break;
                case '*':
                    tokens.push({
                        type: TokenType.ASTERISK,
                        start: lastContentAt,
                        data: '*',
                        end: stream.index(),
                    });
                    break;
                case '=':
                    tokens.push({
                        type: TokenType.ASSIGN,
                        start: lastContentAt,
                        data: '=',
                        end: stream.index(),
                    });
                    break;
                default:
                    throw new FactoryCharacterException(
                        stream,
                        `unknown character Ln ${line}, Col ${stream.index()} (${character})`
                    );
            }
        lastContentAt = stream.index();
    }
    tokens.push({
        type: TokenType.EOL,
        start: lastContentAt,
        data: os.EOL,
        end: stream.index(),
    });
    return tokens;
}

function buildTag(stream: IterableStream<string>): string {
    let content: string = stream.getCurrentEntry() as string;
    while (stream.hasEntriesLeft()) {
        const character: string = stream.step() as string;
        if (!/\w|-/.test(character)) {
            stream.stepBackwards();
            break;
        }
        content += character;
    }

    return content;
}

function buildString(stream: IterableStream<string>): string {
    let content = '';
    let contentOfEscapeCharacter = false;

    while (stream.hasEntriesLeft()) {
        const character: string = stream.step() as string;
        if (character == '\\') {
            contentOfEscapeCharacter = true;
            content += character;
            continue;
        }
        if (!contentOfEscapeCharacter && character == '"') {
            break;
        }
        content += character;
        contentOfEscapeCharacter = false;
    }

    return content;
}
