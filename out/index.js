"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Path = require("path");
const factory_transpiler_1 = require("./factory-transpiler");
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
            const result = (0, factory_transpiler_1.getBuilderResult)(data, debug);
            if (result.error != null) {
                console.log('ERROR');
                console.log(result.error.errorString);
                console.log('Ln ' + result.error.line + ', Col ' + result.error.column);
                return;
            }
            try {
                let name = Path.basename(dir);
                const matches = (_a = name.match(/[^\.]*(?=\.)/gm)) === null || _a === void 0 ? void 0 : _a.filter((ref) => ref.length > 0);
                if (matches) {
                    name = '';
                    for (let i = 0; i < matches.length; i++) {
                        name += matches[i] + (i == matches.length - 1 ? '' : '.');
                    }
                }
                fs.writeFileSync(`${Path.dirname(dir)}/${name}.${fileType}`, result.domElements);
            }
            catch (err) {
                console.error(err);
                return;
            }
        }
        else {
            console.error('file does not exist');
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
