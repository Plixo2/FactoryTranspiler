import { IterableStream } from './iterable-stream';
import { Token, TokenType } from './tokenizer';
import os = require('os');
import { DomObject, StringBuilder } from './dom-object';
import { createContentTag, createTextObject, createSingtonTag } from './dom-object';
import { FactoryMismatchException, FactorySyntaxException, FactoryTokenException } from './exceptions';

export function createSyntaxTree(stream: IterableStream<Token>): DomObject {
    const objects: DomObject[] = createDomObjects(stream, TokenType.EOF);

    function debug(buffer: StringBuilder) {
        buffer.append('DOM');
        buffer.append(os.EOL);
        for (let i = 0; i < objects.length; i++) {
            const next: DomObject = objects[i];
            if (i < objects.length - 1) {
                next.buildTreeModel(buffer, '├── ', '│   ');
            } else {
                next.buildTreeModel(buffer, '└── ', '    ');
            }
        }
        return buffer.toString();
    }
    return {
        buildElement: () => {
            let content: string = '';
            objects.forEach((ref) => {
                content += ref.buildElement() + os.EOL;
            });
            return content;
        },
        buildTreeModel: (stringBuilder) => debug(stringBuilder),
    };
}

function createDomObjects(stream: IterableStream<Token>, returnOn: TokenType = TokenType.BRACES_CLOSED): DomObject[] {
    const tags: DomObject[] = [];

    let wasExited = false;
    while (stream.hasEntriesLeft()) {
        const tag: Token = stream.step();

        if (tag == undefined) {
            throw new FactoryTokenException(stream, 'found null, but expected tag, string or closing braces');
            return tags;
        } else if (tag.type === TokenType.TAG) {
            const bracket: Token = stream.step();
            if (bracket == undefined) {
                throw new FactoryTokenException(stream, null, TokenType.PARENTHESES_OPEN);
            }
            if (bracket.type === TokenType.PARENTHESES_OPEN) {
                const attributes: Token[] = convertToAttributes(stream);
                const closingBracket: Token = stream.getCurrentEntry();
                if (closingBracket == undefined) {
                    throw new FactoryTokenException(stream, null, TokenType.PARENTHESES_CLOSED);
                }
                if (closingBracket.type === TokenType.PARENTHESES_CLOSED) {
                    const braces: Token = stream.step();
                    if (braces != undefined && braces.type === TokenType.BRACES_OPEN) {
                        tags.push(createContentTag(tag, attributes, createDomObjects(stream)));
                    } else {
                        tags.push(createSingtonTag(tag, attributes));
                        if (braces != undefined) stream.stepBackwards();
                    }
                } else {
                    throw new FactoryTokenException(stream, closingBracket, TokenType.PARENTHESES_CLOSED);
                }
            } else {
                throw new FactoryTokenException(stream, bracket, TokenType.PARENTHESES_OPEN);
            }
        } else if (tag.type === returnOn) {
            return tags;
        } else if (tag.type === TokenType.STRING) {
            tags.push(createTextObject(tag));
        } else {
            throw new FactoryTokenException(
                stream,
                'found ' + TokenType[tag.type] + ', but expected tag, string or closing braces'
            );
        }
    }

    throw new FactoryMismatchException(
        stream,
        'some tokens to parse where left, check your opening and closing braces'
    );
}

function convertToAttributes(stream: IterableStream<Token>): Token[] {
    const tokens: Token[] = [];
    while (stream.hasEntriesLeft()) {
        const token: Token = stream.step();
        if (token == undefined) {
            throw new FactoryTokenException(stream, null, TokenType.PARENTHESES_CLOSED);
        }

        if (token.type === TokenType.PARENTHESES_CLOSED) {
            return tokens;
        }

        tokens.push(convertToAttribute(stream));
    }
    throw new FactorySyntaxException(stream, 'failed to find closing parentheses');
}
function convertToAttribute(stream: IterableStream<Token>): Token {
    const start = stream.getCurrentEntry();
    if (start == undefined) {
        throw new FactoryTokenException(stream, 'found null, but expected opening bracket, tag or opening parentheses');
    }
    const startIndex = stream.index();

    if (start.type === TokenType.BRACKET_OPEN) {
        const content = stream.step();
        if (content != undefined && content.type === TokenType.TAG) {
            const closing = stream.step();
            if (closing != undefined && closing.type === TokenType.BRACKET_CLOSED) {
                const assign = convertToAttributeContent(stream);
                let suffix = '';
                if (assign) {
                    suffix = '=' + assign.data;
                }

                return {
                    type: TokenType.ATTRIBUTE,
                    data: '[' + content.data + ']' + suffix,
                    start: startIndex,
                    end: stream.index(),
                };
            } else {
                throw new FactoryTokenException(stream, closing, TokenType.BRACKET_CLOSED);
            }
        } else {
            throw new FactoryTokenException(stream, content, TokenType.TAG);
        }
    } else if (start.type === TokenType.PARENTHESES_OPEN) {
        const content = stream.step();
        if (content != undefined && content.type === TokenType.TAG) {
            const closing = stream.step();
            if (closing != undefined && closing.type === TokenType.PARENTHESES_CLOSED) {
                const assign = convertToAttributeContent(stream);
                let suffix = '';
                if (assign) {
                    suffix = '=' + assign.data;
                }

                return {
                    type: TokenType.ATTRIBUTE,
                    data: '(' + content.data + ')' + suffix,
                    start: startIndex,
                    end: stream.index(),
                };
            } else {
                throw new FactoryTokenException(stream, closing, TokenType.PARENTHESES_CLOSED);
            }
        } else {
            throw new FactoryTokenException(stream, content, TokenType.TAG);
        }
    } else if (start.type === TokenType.TAG) {
        const assign = convertToAttributeContent(stream);
        let suffix = '';
        if (assign) {
            suffix = '=' + assign.data;
        }

        return {
            type: TokenType.ATTRIBUTE,
            data: start.data + suffix,
            start: startIndex,
            end: stream.index(),
        };
    } else if (start.type === TokenType.ASTERISK) {
        const content = stream.step();
        if (content != undefined && content.type === TokenType.TAG) {
            const assign = convertToAttributeContent(stream);
            let suffix = '';
            if (assign) {
                suffix = '=' + assign.data;
            }

            return {
                type: TokenType.ATTRIBUTE,
                data: '*' + content.data + suffix,
                start: startIndex,
                end: stream.index(),
            };
        } else {
            throw new FactoryTokenException(stream, content, TokenType.TAG);
        }
    } else {
        throw new FactoryTokenException(
            stream,
            `found ${TokenType[start.type]}, but expected opening bracket, tag or opening parentheses`
        );
    }
}

function convertToAttributeContent(stream: IterableStream<Token>): Token | undefined {
    const assign = stream.step();

    if (assign == undefined) {
        throw new FactoryTokenException(stream, null, TokenType.BRACKET_CLOSED);
    }
    if (assign.type === TokenType.ASSIGN) {
        const string = stream.step();
        if (string != undefined && string.type === TokenType.STRING) {
            return string;
        } else {
            throw new FactoryTokenException(stream, string, TokenType.STRING);
        }
    } else {
        stream.stepBackwards();
        return undefined;
    }
}
