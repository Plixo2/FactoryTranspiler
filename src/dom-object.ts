import { Token } from './tokenizer';
import os = require('os');

export interface DomObject {
    buildElement: () => string;
    buildTreeModel: (string: StringBuilder, prefix: string, childrenPrefix: string) => void;
}

export function createTextObject(text: Token): DomObject {
    function buildTag(): string {
        return JSON.parse(text.data);
    }

    function buildTreeModel(buffer: StringBuilder, prefix: string, childrenPrefix: string): void {
        buffer.append(prefix);
        buffer.append('Text: ').append(text.data);
        buffer.append(os.EOL);
    }
    return {
        buildElement: () => buildTag(),
        buildTreeModel: (string, prefix, childrenPrefix) => buildTreeModel(string, prefix, childrenPrefix),
    };
}

export function createSingtonTag(tag: Token, attributes: Token[]): DomObject {
    function buildTag(): string {
        let tagBuilder: StringBuilder = new StringBuilder();
        tagBuilder.append('<').append(getData(tag)).append(' ').append(buildAttributes(attributes)).append('/>');
        return tagBuilder.toString();
    }

    function buildTreeModel(buffer: StringBuilder, prefix: string, childrenPrefix: string): void {
        buffer.append(prefix);
        buffer.append('Singleton: ').append(getData(tag)).append(' ').append(buildAttributes(attributes));
        buffer.append(os.EOL);
    }

    return {
        buildElement: () => buildTag(),
        buildTreeModel: (string, prefix, childrenPrefix) => buildTreeModel(string, prefix, childrenPrefix),
    };
}

export function createContentTag(tag: Token, attributes: Token[], content: DomObject[]): DomObject {
    function buildTag(): string {
        let tagBuilder: StringBuilder = new StringBuilder();
        tagBuilder.append('<').append(getData(tag)).append(' ').append(buildAttributes(attributes)).append('>');
        tagBuilder.append(os.EOL);
        tagBuilder.append(buildContent());
        tagBuilder.append('</').append(getData(tag)).append('>');
        return tagBuilder.toString();
    }

    function buildContent(): string {
        const contentString = new StringBuilder();
        content.forEach((token) => {
            const content: string = token.buildElement().replace(os.EOL, os.EOL + '    ');
            contentString.append('    ').append(content).append(os.EOL);
        });
        return contentString.toString();
    }

    function buildTreeModel(buffer: StringBuilder, prefix: string, childrenPrefix: string): void {
        buffer.append(prefix);
        buffer.append('Content: ').append(getData(tag)).append(' ').append(buildAttributes(attributes));
        buffer.append(os.EOL);
        for (let i = 0; i < content.length; i++) {
            const next: DomObject = content[i];
            if (i < content.length - 1) {
                next.buildTreeModel(buffer, childrenPrefix + '????????? ', childrenPrefix + '???   ');
            } else {
                next.buildTreeModel(buffer, childrenPrefix + '????????? ', childrenPrefix + '    ');
            }
        }
    }

    return {
        buildElement: () => buildTag(),
        buildTreeModel: (string, prefix, childrenPrefix) => buildTreeModel(string, prefix, childrenPrefix),
    };
}

function getData(token: Token): string {
    return token.data;
}

function buildAttributes(attributes: Token[]): string {
    let attributesString = '';
    attributes.forEach((token) => {
        attributesString += getData(token) + ' ';
    });
    return attributesString;
}

export class StringBuilder {
    value: string = '';

    append(value: string): StringBuilder {
        this.value += value;
        return this;
    }

    toString() {
        return this.value;
    }
}
