"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringBuilder = exports.createContentTag = exports.createSingtonTag = exports.createTextObject = void 0;
const os = require("os");
function createTextObject(text) {
    function buildTag() {
        return JSON.parse(text.data);
    }
    function buildTreeModel(buffer, prefix, childrenPrefix) {
        buffer.append(prefix);
        buffer.append('Text: ').append(text.data);
        buffer.append(os.EOL);
    }
    return {
        buildElement: () => buildTag(),
        buildTreeModel: (string, prefix, childrenPrefix) => buildTreeModel(string, prefix, childrenPrefix),
    };
}
exports.createTextObject = createTextObject;
function createSingtonTag(tag, attributes) {
    function buildTag() {
        let tagBuilder = new StringBuilder();
        tagBuilder.append('<').append(getData(tag)).append(' ').append(buildAttributes(attributes)).append('/>');
        return tagBuilder.toString();
    }
    function buildTreeModel(buffer, prefix, childrenPrefix) {
        buffer.append(prefix);
        buffer.append('Singleton: ').append(getData(tag)).append(' ').append(buildAttributes(attributes));
        buffer.append(os.EOL);
    }
    return {
        buildElement: () => buildTag(),
        buildTreeModel: (string, prefix, childrenPrefix) => buildTreeModel(string, prefix, childrenPrefix),
    };
}
exports.createSingtonTag = createSingtonTag;
function createContentTag(tag, attributes, content) {
    function buildTag() {
        let tagBuilder = new StringBuilder();
        tagBuilder.append('<').append(getData(tag)).append(' ').append(buildAttributes(attributes)).append('>');
        tagBuilder.append(os.EOL);
        tagBuilder.append(buildContent());
        tagBuilder.append('</').append(getData(tag)).append('>');
        return tagBuilder.toString();
    }
    function buildContent() {
        const contentString = new StringBuilder();
        content.forEach((token) => {
            const content = token.buildElement().replace(os.EOL, os.EOL + '    ');
            contentString.append('    ').append(content).append(os.EOL);
        });
        return contentString.toString();
    }
    function buildTreeModel(buffer, prefix, childrenPrefix) {
        buffer.append(prefix);
        buffer.append('Content: ').append(getData(tag)).append(' ').append(buildAttributes(attributes));
        buffer.append(os.EOL);
        for (let i = 0; i < content.length; i++) {
            const next = content[i];
            if (i < content.length - 1) {
                next.buildTreeModel(buffer, childrenPrefix + '????????? ', childrenPrefix + '???   ');
            }
            else {
                next.buildTreeModel(buffer, childrenPrefix + '????????? ', childrenPrefix + '    ');
            }
        }
    }
    return {
        buildElement: () => buildTag(),
        buildTreeModel: (string, prefix, childrenPrefix) => buildTreeModel(string, prefix, childrenPrefix),
    };
}
exports.createContentTag = createContentTag;
function getData(token) {
    return token.data;
}
function buildAttributes(attributes) {
    let attributesString = '';
    attributes.forEach((token) => {
        attributesString += getData(token) + ' ';
    });
    return attributesString;
}
class StringBuilder {
    constructor() {
        this.value = '';
    }
    append(value) {
        this.value += value;
        return this;
    }
    toString() {
        return this.value;
    }
}
exports.StringBuilder = StringBuilder;
