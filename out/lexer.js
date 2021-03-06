"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSyntaxTree = void 0;
const tokenizer_1 = require("./tokenizer");
const os = require("os");
const dom_object_1 = require("./dom-object");
const exceptions_1 = require("./exceptions");
function createSyntaxTree(stream) {
    const objects = createDomObjects(stream, tokenizer_1.TokenType.EOF);
    function debug(buffer) {
        buffer.append('DOM');
        buffer.append(os.EOL);
        for (let i = 0; i < objects.length; i++) {
            const next = objects[i];
            if (i < objects.length - 1) {
                next.buildTreeModel(buffer, '├── ', '│   ');
            }
            else {
                next.buildTreeModel(buffer, '└── ', '    ');
            }
        }
        return buffer.toString();
    }
    return {
        buildElement: () => {
            let content = '';
            objects.forEach((ref) => {
                content += ref.buildElement() + os.EOL;
            });
            return content;
        },
        buildTreeModel: (stringBuilder) => debug(stringBuilder),
    };
}
exports.createSyntaxTree = createSyntaxTree;
function createDomObjects(stream, returnOn = tokenizer_1.TokenType.BRACES_CLOSED) {
    const tags = [];
    let wasExited = false;
    while (stream.hasEntriesLeft()) {
        const tag = stream.step();
        if (tag == undefined) {
            throw new exceptions_1.FactoryTokenException(stream, 'found null, but expected tag, string or closing braces');
            return tags;
        }
        else if (tag.type === tokenizer_1.TokenType.TAG) {
            const bracket = stream.step();
            if (bracket == undefined) {
                throw new exceptions_1.FactoryTokenException(stream, null, tokenizer_1.TokenType.PARENTHESES_OPEN);
            }
            if (bracket.type === tokenizer_1.TokenType.PARENTHESES_OPEN) {
                const attributes = convertToAttributes(stream);
                const closingBracket = stream.getCurrentEntry();
                if (closingBracket == undefined) {
                    throw new exceptions_1.FactoryTokenException(stream, null, tokenizer_1.TokenType.PARENTHESES_CLOSED);
                }
                if (closingBracket.type === tokenizer_1.TokenType.PARENTHESES_CLOSED) {
                    const braces = stream.step();
                    if (braces != undefined && braces.type === tokenizer_1.TokenType.BRACES_OPEN) {
                        tags.push((0, dom_object_1.createContentTag)(tag, attributes, createDomObjects(stream)));
                    }
                    else {
                        tags.push((0, dom_object_1.createSingtonTag)(tag, attributes));
                        if (braces != undefined)
                            stream.stepBackwards();
                    }
                }
                else {
                    throw new exceptions_1.FactoryTokenException(stream, closingBracket, tokenizer_1.TokenType.PARENTHESES_CLOSED);
                }
            }
            else {
                throw new exceptions_1.FactoryTokenException(stream, bracket, tokenizer_1.TokenType.PARENTHESES_OPEN);
            }
        }
        else if (tag.type === returnOn) {
            return tags;
        }
        else if (tag.type === tokenizer_1.TokenType.STRING) {
            tags.push((0, dom_object_1.createTextObject)(tag));
        }
        else {
            throw new exceptions_1.FactoryTokenException(stream, 'found ' + tokenizer_1.TokenType[tag.type] + ', but expected tag, string or closing braces');
        }
    }
    throw new exceptions_1.FactoryMismatchException(stream, 'some tokens to parse where left, check your opening and closing braces');
}
function convertToAttributes(stream) {
    const tokens = [];
    while (stream.hasEntriesLeft()) {
        const token = stream.step();
        if (token == undefined) {
            throw new exceptions_1.FactoryTokenException(stream, null, tokenizer_1.TokenType.PARENTHESES_CLOSED);
        }
        if (token.type === tokenizer_1.TokenType.PARENTHESES_CLOSED) {
            return tokens;
        }
        tokens.push(convertToAttribute(stream));
    }
    throw new exceptions_1.FactorySyntaxException(stream, 'failed to find closing parentheses');
}
function convertToAttribute(stream) {
    const start = stream.getCurrentEntry();
    if (start == undefined) {
        throw new exceptions_1.FactoryTokenException(stream, 'found null, but expected opening bracket, tag or opening parentheses');
    }
    const startIndex = stream.index();
    if (start.type === tokenizer_1.TokenType.BRACKET_OPEN) {
        const content = stream.step();
        if (content != undefined && content.type === tokenizer_1.TokenType.TAG) {
            const closing = stream.step();
            if (closing != undefined && closing.type === tokenizer_1.TokenType.BRACKET_CLOSED) {
                const assign = convertToAttributeContent(stream);
                let suffix = '';
                if (assign) {
                    suffix = '=' + assign.data;
                }
                return {
                    type: tokenizer_1.TokenType.ATTRIBUTE,
                    data: '[' + content.data + ']' + suffix,
                    start: startIndex,
                    end: stream.index(),
                };
            }
            else {
                throw new exceptions_1.FactoryTokenException(stream, closing, tokenizer_1.TokenType.BRACKET_CLOSED);
            }
        }
        else {
            throw new exceptions_1.FactoryTokenException(stream, content, tokenizer_1.TokenType.TAG);
        }
    }
    else if (start.type === tokenizer_1.TokenType.PARENTHESES_OPEN) {
        const content = stream.step();
        if (content != undefined && content.type === tokenizer_1.TokenType.TAG) {
            const closing = stream.step();
            if (closing != undefined && closing.type === tokenizer_1.TokenType.PARENTHESES_CLOSED) {
                const assign = convertToAttributeContent(stream);
                let suffix = '';
                if (assign) {
                    suffix = '=' + assign.data;
                }
                return {
                    type: tokenizer_1.TokenType.ATTRIBUTE,
                    data: '(' + content.data + ')' + suffix,
                    start: startIndex,
                    end: stream.index(),
                };
            }
            else {
                throw new exceptions_1.FactoryTokenException(stream, closing, tokenizer_1.TokenType.PARENTHESES_CLOSED);
            }
        }
        else {
            throw new exceptions_1.FactoryTokenException(stream, content, tokenizer_1.TokenType.TAG);
        }
    }
    else if (start.type === tokenizer_1.TokenType.TAG) {
        const assign = convertToAttributeContent(stream);
        let suffix = '';
        if (assign) {
            suffix = '=' + assign.data;
        }
        return {
            type: tokenizer_1.TokenType.ATTRIBUTE,
            data: start.data + suffix,
            start: startIndex,
            end: stream.index(),
        };
    }
    else if (start.type === tokenizer_1.TokenType.ASTERISK) {
        const content = stream.step();
        if (content != undefined && content.type === tokenizer_1.TokenType.TAG) {
            const assign = convertToAttributeContent(stream);
            let suffix = '';
            if (assign) {
                suffix = '=' + assign.data;
            }
            return {
                type: tokenizer_1.TokenType.ATTRIBUTE,
                data: '*' + content.data + suffix,
                start: startIndex,
                end: stream.index(),
            };
        }
        else {
            throw new exceptions_1.FactoryTokenException(stream, content, tokenizer_1.TokenType.TAG);
        }
    }
    else {
        throw new exceptions_1.FactoryTokenException(stream, `found ${tokenizer_1.TokenType[start.type]}, but expected opening bracket, tag or opening parentheses`);
    }
}
function convertToAttributeContent(stream) {
    const assign = stream.step();
    if (assign == undefined) {
        throw new exceptions_1.FactoryTokenException(stream, null, tokenizer_1.TokenType.BRACKET_CLOSED);
    }
    if (assign.type === tokenizer_1.TokenType.ASSIGN) {
        const string = stream.step();
        if (string != undefined && string.type === tokenizer_1.TokenType.STRING) {
            return string;
        }
        else {
            throw new exceptions_1.FactoryTokenException(stream, string, tokenizer_1.TokenType.STRING);
        }
    }
    else {
        stream.stepBackwards();
        return undefined;
    }
}
