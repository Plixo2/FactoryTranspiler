"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Path = require("path");
const dom_object_1 = require("./dom-object");
const exceptions_1 = require("./exceptions");
const lexer_1 = require("./lexer");
const tokenizer_1 = require("./tokenizer");
const fileType = 'html';
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
            const content = object.buildElement();
            let debug = process.argv.length >= 3 && process.argv.length[3] === 'debug';
            if (debug) {
                const builder = new dom_object_1.StringBuilder();
                object.buildTreeModel(builder, '', '');
            }
            if (content)
                try {
                    let name = Path.basename(dir);
                    const matches = (_a = name.match(/[^\.]*(?=\.)/gm)) === null || _a === void 0 ? void 0 : _a.filter((ref) => ref.length > 0);
                    if (matches) {
                        name = '';
                        for (let i = 0; i < matches.length; i++) {
                            name += matches[i] + (i == matches.length - 1 ? '' : '.');
                        }
                    }
                    fs.writeFileSync(`${Path.dirname(dir)}/${name}.${fileType}`, content);
                }
                catch (err) {
                    console.error(err);
                }
        }
        catch (err) {
            if (err instanceof exceptions_1.FactoryException) {
                const factory = err;
                console.error('Error at ' + factory.stream.index());
            }
            else {
                console.error(err);
            }
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
