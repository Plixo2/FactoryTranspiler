import * as fs from 'fs';
import * as Path from 'path';

import { FactoryBuilderResult, getBuilderResult } from './factory-transpiler';

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
            const result: FactoryBuilderResult = getBuilderResult(data, debug);
            if (result.error != null) {
                console.log('ERROR');
                console.log(result.error.errorString);
                console.log('Ln ' + result.error.line + ', Col ' + result.error.column);

                return;
            }
            try {
                let name = Path.basename(dir);
                const matches = name.match(/[^\.]*(?=\.)/gm)?.filter((ref) => ref.length > 0);
                if (matches) {
                    name = '';
                    for (let i = 0; i < matches.length; i++) {
                        name += matches[i] + (i == matches.length - 1 ? '' : '.');
                    }
                }
                fs.writeFileSync(`${Path.dirname(dir)}/${name}.${fileType}`, result.domElements);
            } catch (err) {
                console.error(err);
                return;
            }
        } else {
            console.error('file does not exist');
        }
    } else {
        console.error('please supply at least one argument');
        return;
    }

    if (debug) {
        console.log('Found 0 errors');
    }
}
