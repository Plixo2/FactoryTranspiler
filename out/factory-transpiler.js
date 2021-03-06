"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuilderResult = exports.getLexerResult = exports.getTokenitzerResult = void 0;
const dom_object_1 = require("./dom-object");
const exceptions_1 = require("./exceptions");
const lexer_1 = require("./lexer");
const tokenizer_1 = require("./tokenizer");
function getTokenitzerResult(data, debug = false) {
    const result = compile(data, false, false, debug);
    return {
        error: result.error,
        tokens: result.tokens,
    };
}
exports.getTokenitzerResult = getTokenitzerResult;
function getLexerResult(data, debug = false) {
    const result = compile(data, false, true, debug);
    return {
        error: result.error,
        ast: result.ast,
        tokens: result.tokens,
    };
}
exports.getLexerResult = getLexerResult;
function getBuilderResult(data, debug = false) {
    const result = compile(data, true, true, debug);
    return {
        domElements: result.domElements,
        error: result.error,
        ast: result.ast,
        tokens: result.tokens,
    };
}
exports.getBuilderResult = getBuilderResult;
function compile(data, builder, lexer, debug = false) {
    let error = undefined;
    let domContent = undefined;
    let tokens = undefined;
    let ast = undefined;
    try {
        tokens = (0, tokenizer_1.createTokenStream)(data);
        ast = (0, lexer_1.createSyntaxTree)(tokens);
        domContent = ast.buildElement();
        if (debug) {
            const builder = new dom_object_1.StringBuilder();
            ast.buildTreeModel(builder, '', '');
        }
    }
    catch (exception) {
        if (exception instanceof exceptions_1.FactoryTokenException) {
            const factoryException = exception;
            let lines = '';
            let line = '';
            let lineIndex = 1;
            for (let i = 0; i < factoryException.stream.index(); i++) {
                if (factoryException.stream.entries[i].type == tokenizer_1.TokenType.EOL) {
                    lines += line + '\n';
                    line = '';
                    lineIndex += 1;
                }
                else {
                    line += factoryException.stream.entries[i].data;
                }
            }
            lines += line + '<--- Here';
            error = {
                line: lineIndex,
                column: line.length,
                errorString: lines,
            };
        }
        else if (exception instanceof exceptions_1.FactoryCharacterException) {
            const factoryException = exception;
            let lines = '';
            let line = '';
            let lineIndex = 1;
            for (let i = 0; i < factoryException.stream.index(); i++) {
                if (factoryException.stream.entries[i] == '\n') {
                    lines += line + '\n';
                    line = '';
                    lineIndex += 1;
                }
                else {
                    line += factoryException.stream.entries[i];
                }
            }
            lines += line + '<--- Here';
            error = {
                line: lineIndex,
                column: line.length,
                errorString: lines,
            };
        }
        else {
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
