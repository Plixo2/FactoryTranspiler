"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenStream = exports.TokenType = void 0;
const iterable_stream_1 = require("./iterable-stream");
const os = require("os");
const exceptions_1 = require("./exceptions");
var TokenType;
(function (TokenType) {
    TokenType[TokenType["TAG"] = 0] = "TAG";
    TokenType[TokenType["ATTRIBUTE"] = 1] = "ATTRIBUTE";
    TokenType[TokenType["STRING"] = 2] = "STRING";
    TokenType[TokenType["PARENTHESES_OPEN"] = 3] = "PARENTHESES_OPEN";
    TokenType[TokenType["PARENTHESES_CLOSED"] = 4] = "PARENTHESES_CLOSED";
    TokenType[TokenType["BRACES_OPEN"] = 5] = "BRACES_OPEN";
    TokenType[TokenType["BRACES_CLOSED"] = 6] = "BRACES_CLOSED";
    TokenType[TokenType["BRACKET_OPEN"] = 7] = "BRACKET_OPEN";
    TokenType[TokenType["BRACKET_CLOSED"] = 8] = "BRACKET_CLOSED";
    TokenType[TokenType["ASSIGN"] = 9] = "ASSIGN";
    TokenType[TokenType["ASTERISK"] = 10] = "ASTERISK";
    TokenType[TokenType["EOL"] = 11] = "EOL";
    TokenType[TokenType["WHITESPACE"] = 12] = "WHITESPACE";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
function createTokenStream(input) {
    const tokens = [];
    let line = 0;
    input.split(os.EOL).forEach((lineString) => {
        tokens.push(...createLineTokens(line, lineString));
        line += 1;
    });
    return new iterable_stream_1.IterableStream(tokens);
}
exports.createTokenStream = createTokenStream;
function createLineTokens(line, input) {
    const tokens = [];
    const chars = Array.from(input);
    const stream = new iterable_stream_1.IterableStream(chars);
    let lastContentAt = 0;
    while (stream.hasEntriesLeft()) {
        const character = stream.step();
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
        }
        else if (/[A-Za-z]/.test(character)) {
            tokens.push({
                type: TokenType.TAG,
                start: lastContentAt,
                data: buildTag(stream),
                end: stream.index(),
            });
        }
        else
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
                    throw new exceptions_1.FactoryCharacterException(stream, `unknown character Ln ${line}, Col ${stream.index()} (${character})`);
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
function buildTag(stream) {
    let content = stream.getCurrentEntry();
    while (stream.hasEntriesLeft()) {
        const character = stream.step();
        if (!/\w|-/.test(character)) {
            stream.stepBackwards();
            break;
        }
        content += character;
    }
    return content;
}
function buildString(stream) {
    let content = '';
    let contentOfEscapeCharacter = false;
    while (stream.hasEntriesLeft()) {
        const character = stream.step();
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