"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IterableStream = void 0;
class IterableStream {
    constructor(list) {
        this.position = 0;
        this.currentToken = undefined;
        this.entries = list;
        this.position = 0;
    }
    step() {
        if (this.position >= this.entries.length) {
            return undefined;
        }
        this.currentToken = this.entries[this.position];
        this.position += 1;
        return this.currentToken;
    }
    stepBackwards() {
        this.position -= 1;
        this.currentToken = this.entries[this.position];
    }
    reset() {
        this.position = 0;
        this.step();
    }
    hasEntriesLeft() {
        return this.position < this.entries.length;
    }
    index() {
        return this.position;
    }
    getCurrentEntry() {
        return this.currentToken;
    }
}
exports.IterableStream = IterableStream;
