import { Socket } from 'dgram';
import * as fs from 'fs';
import * as Path from 'path';
import { DomObject, StringBuilder } from './dom-object';
import { FactoryException } from './exceptions';
import { IterableStream } from './iterable-stream';
import { createSyntaxTree } from './lexer';
import { createTokenStream, Token, TokenType } from './tokenizer';

const fileType: string = 'html';

if (process.argv.length >= 2) {
    const dir: string = process.argv[2];

    if (fs.existsSync(dir)) {
        let data: string = '';
        try {
            data = fs.readFileSync(dir).toString();
        } catch (err) {
            console.error(err);
        }

        try {
            const stream: IterableStream<Token> = createTokenStream(data);
            filterContentlessTokens(stream);
            const object: DomObject = createSyntaxTree(stream);
            const content: string = object.buildElement();

            let debug = process.argv.length >= 3 && process.argv.length[3] === 'debug';
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
                }
        } catch (err) {
            if (err instanceof FactoryException) {
                const factory: FactoryException = err;
                console.error('Error at ' + factory.stream.index());
            } else {
                console.error(err);
            }
        }
    } else {
        console.error('file does not exist');
    }
}

function filterContentlessTokens(stream: IterableStream<Token>): void {
    stream.entries = stream.entries.filter((token) => {
        return token.type != TokenType.EOL && token.type != TokenType.WHITESPACE;
    });
}
