import { Socket } from 'dgram';
import * as fs from 'fs';
import { DomObject, StringBuilder } from './dom-object';
import { FactoryException } from './exceptions';
import { IterableStream } from './iterable-stream';
import { createSyntaxTree } from './lexer';
import { createTokenStream, Token, TokenType } from './tokenizer';

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
            console.log(object.buildElement());
            const builder: StringBuilder = new StringBuilder();
            object.buildTreeModel(builder, '', '');
            console.log(builder.toString());
        } catch (err) {
            if (err instanceof FactoryException) {
                const factory: FactoryException = err;
                console.error('Error at ' + factory.stream.index());
            }
            //console.error(err);
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
