import { Socket } from 'dgram';
import * as fs from 'fs';
import * as Path from 'path';
import os = require('os');

import { DomObject, StringBuilder } from './dom-object';
import { FactoryCharacterException, FactoryException, FactoryTokenException } from './exceptions';
import { IterableStream } from './iterable-stream';
import { createSyntaxTree } from './lexer';
import { createTokenStream, Token, TokenType } from './tokenizer';

const fileType: string = 'html';
const debug = process.argv.length >= 3 && process.argv[3] === 'debug';
main();
function main() {
    if (process.argv.length >= 2) {
        const dir: string = process.argv[2];

        if (fs.existsSync(dir)) {
            let data: string = '';
            try {
                data = fs.readFileSync(dir).toString();
            } catch (err) {
                console.error(err);
                return;
            }

            try {
                const stream: IterableStream<Token> = createTokenStream(data);
                const object: DomObject = createSyntaxTree(stream);
                const content: string = object.buildElement();

                if (debug) {
                    const builder: StringBuilder = new StringBuilder();
                    object.buildTreeModel(builder, '', '');
                }
                if (content)
                    try {
                        let name = Path.basename(dir);
                        const matches = name.match(/[^\.]*(?=\.)/gm)?.filter((ref) => ref.length > 0);
                        if (matches) {
                            name = '';
                            for (let i = 0; i < matches.length; i++) {
                                name += matches[i] + (i == matches.length - 1 ? '' : '.');
                            }
                        }
                        fs.writeFileSync(`${Path.dirname(dir)}/${name}.${fileType}`, content);
                    } catch (err) {
                        console.error(err);
                        return;
                    }
            } catch (err) {
                if (err instanceof FactoryTokenException) {
                    const factory: FactoryTokenException = err;
                    let line = '';
                    let lineIndex = 1;
                    for (let i = 0; i < factory.stream.index(); i++) {
                        if (factory.stream.entries[i].type == TokenType.EOL) {
                            console.log(line);
                            line = '';
                            lineIndex += 1;
                        } else {
                            line += factory.stream.entries[i].data;
                        }
                    }
                    console.log(line + '<--- Here');
                    console.log('Line ' + lineIndex);
                    console.log('Position ' + line.length);
                } else if (err instanceof FactoryCharacterException) {
                    const factory: FactoryCharacterException = err;
                    let line = '';
                    let lineIndex = 1;
                    for (let i = 0; i < factory.stream.index(); i++) {
                        if (factory.stream.entries[i] === '\n') {
                            console.log(line);
                            line = '';
                            lineIndex += 1;
                        } else {
                            line += factory.stream.entries[i];
                        }
                    }
                    console.log(line + '<--- Here');
                    console.log('Line ' + lineIndex);
                    console.log('Position ' + line.length);
                } else {
                    console.error(err);
                }
                return;
            }
        } else {
            console.error('file does not exist');
            return;
        }
    } else {
        console.error('please supply at least one argument');
        return;
    }

    if (debug) {
        console.log('Found 0 errors');
    }
}

function getLine(input: string, position: number): { line: number; position: number } {
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
