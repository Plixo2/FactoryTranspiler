"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactoryMismatchException = exports.FactorySyntaxException = exports.FactoryTokenException = exports.FactoryCharacterException = exports.FactoryException = void 0;
const tokenizer_1 = require("./tokenizer");
class FactoryException extends Error {
    constructor(stream, text) {
        super(text);
        this.stream = stream;
    }
}
exports.FactoryException = FactoryException;
class FactoryCharacterException extends FactoryException {
    constructor(stream, error) {
        super(stream, error);
    }
}
exports.FactoryCharacterException = FactoryCharacterException;
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
class FactorySyntaxException extends FactoryTokenException {
    constructor(stream, error) {
        super(stream, error);
    }
}
exports.FactorySyntaxException = FactorySyntaxException;
class FactoryMismatchException extends FactoryTokenException {
    constructor(stream, error) {
        super(stream, error);
    }
}
exports.FactoryMismatchException = FactoryMismatchException;
