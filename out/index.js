"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Path = require("path");
const os = require("os");
const dom_object_1 = require("./dom-object");
const exceptions_1 = require("./exceptions");
const lexer_1 = require("./lexer");
const tokenizer_1 = require("./tokenizer");
const fileType = 'html';
const debug = process.argv.length >= 3 && process.argv[3] === 'debug';
main();
function main() {
    var _a;
    if (process.argv.length >= 2) {
        const dir = process.argv[2];
        if (fs.existsSync(dir)) {
            let data = '';
            try {
                data = fs.readFileSync(dir).toString();
            }
            catch (err) {
                console.error(err);
                return;
            }
            try {
                const stream = (0, tokenizer_1.createTokenStream)(data);
                const object = (0, lexer_1.createSyntaxTree)(stream);
                const content = object.buildElement();
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
                        return;
                    }
            }
            catch (err) {
                if (err instanceof exceptions_1.FactoryTokenException) {
                    const factory = err;
                    let line = '';
                    let lineIndex = 1;
                    for (let i = 0; i < factory.stream.index(); i++) {
                        if (factory.stream.entries[i].type == tokenizer_1.TokenType.EOL) {
                            console.log(line);
                            line = '';
                            lineIndex += 1;
                        }
                        else {
                            line += factory.stream.entries[i].data;
                        }
                    }
                    console.log(line + '<--- Here');
                    console.log('Line ' + lineIndex);
                    console.log('Position ' + line.length);
                }
                else if (err instanceof exceptions_1.FactoryCharacterException) {
                    const factory = err;
                    let line = '';
                    let lineIndex = 1;
                    for (let i = 0; i < factory.stream.index(); i++) {
                        if (factory.stream.entries[i] === '\n') {
                            console.log(line);
                            line = '';
                            lineIndex += 1;
                        }
                        else {
                            line += factory.stream.entries[i];
                        }
                    }
                    console.log(line + '<--- Here');
                    console.log('Line ' + lineIndex);
                    console.log('Position ' + line.length);
                }
                else {
                    console.error(err);
                }
                return;
            }
        }
        else {
            console.error('file does not exist');
            return;
        }
    }
    else {
        console.error('please supply at least one argument');
        return;
    }
    if (debug) {
        console.log('Found 0 errors');
    }
}
function getLine(input, position) {
    let index = 0;
    let line = 0;
    const text = input.split(os.EOL);
    for (let i = 0; i < text.length; i++) {
        console.log(i);
        console.log(position);
        console.log(index);
        console.log(text[i].length);
        console.log(position > index + text[i].length);
        console.log('');
        if (position <= index - text[i].length) {
            return { line: line, position: position - index };
        }
        line += 1;
        index += text[i].length;
    }
    return { line: -1, position: -1 };
}
