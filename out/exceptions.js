"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactoryCharacterException = exports.FactoryTokenException = exports.FactorySyntaxException = exports.FactoryException = void 0;
const tokenizer_1 = require("./tokenizer");
class FactoryException extends Error {
    constructor(stream, text) {
        super(text);
        this.stream = stream;
    }
}
exports.FactoryException = FactoryException;
class FactorySyntaxException extends FactoryException {
    constructor(stream, error) {
        super(stream, 'Failed to parse: ' + error);
    }
}
exports.FactorySyntaxException = FactorySyntaxException;
class FactoryTokenException extends FactoryException {
    constructor(stream, type, expected) {
        if (typeof type === 'string') {
            super(stream, 'Failed to parse Token: ' + type);
            return;
        }
        super(stream, `Expected ${tokenizer_1.TokenType[expected]} but found ${type == null ? 'none' : tokenizer_1.TokenType[type.type]}`);
    }
}
exports.FactoryTokenException = FactoryTokenException;
class FactoryCharacterException extends FactoryException {
    constructor(stream, error) {
        super(stream, error);
    }
}
exports.FactoryCharacterException = FactoryCharacterException;
