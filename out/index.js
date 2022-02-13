"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const dom_object_1 = require("./dom-object");
const exceptions_1 = require("./exceptions");
const lexer_1 = require("./lexer");
const tokenizer_1 = require("./tokenizer");
if (process.argv.length >= 2) {
    const dir = process.argv[2];
    if (fs.existsSync(dir)) {
        let data = '';
        try {
            data = fs.readFileSync(dir).toString();
        }
        catch (err) {
            console.error(err);
        }
        try {
            const stream = (0, tokenizer_1.createTokenStream)(data);
            filterContentlessTokens(stream);
            const object = (0, lexer_1.createSyntaxTree)(stream);
            console.log(object.buildElement());
            const builder = new dom_object_1.StringBuilder();
            object.buildTreeModel(builder, '', '');
            console.log(builder.toString());
        }
        catch (err) {
            if (err instanceof exceptions_1.FactoryException) {
                const factory = err;
                console.error('Error at ' + factory.stream.index());
            }
            //console.error(err);
        }
    }
    else {
        console.error('file does not exist');
    }
}
function filterContentlessTokens(stream) {
    stream.entries = stream.entries.filter((token) => {
        return token.type != tokenizer_1.TokenType.EOL && token.type != tokenizer_1.TokenType.WHITESPACE;
    });
}
