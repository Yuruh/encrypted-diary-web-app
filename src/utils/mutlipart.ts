// Adapted from https://gist.github.com/dcollien/76d17f69afe748afad7ff3a15ff9a08a

class Parser {
    array: Uint8Array;
    token: any;
    current: any;
    i: any;
    boundary: string;

    constructor(arraybuf: Uint8Array, boundary: string) {
        this.array = arraybuf;
        this.token = null;
        this.current = null;
        this.i = 0;
        this.boundary = boundary;
    }

    skipPastNextBoundary() {
        let boundaryIndex = 0;
        let isBoundary = false;

        while (!isBoundary) {
            if (this.next() === null) {
                return false;
            }

            if (this.current === this.boundary[boundaryIndex]) {
                boundaryIndex++;
                if (boundaryIndex === this.boundary.length) {
                    isBoundary = true;
                }
            } else {
                boundaryIndex = 0;
            }
        }

        return true;
    }

    next() {
        if (this.i >= this.array.byteLength) {
            this.current = null;
            return null;
        }

        this.current = String.fromCharCode(this.array[this.i]);
        this.i++;
        return this.current;
    }

    parseHeader() {
        let header = '';
        const _this = this;
        const skipUntilNextLine = function () {
            header += _this.next();
            while (_this.current !== '\n' && _this.current !== null) {
                header += _this.next();
            }
            if (_this.current === null) {
                return null;
            }
        };

        let hasSkippedHeader = false;
        while (!hasSkippedHeader) {
            skipUntilNextLine();
            header += this.next();
            if (this.current === '\r') {
                header += this.next(); // skip
            }

            if (this.current === '\n') {
                hasSkippedHeader = true;
            } else if (this.current === null) {
                return null;
            }
        }

        return header;
    }
}

interface ISection {
    bodyStart: number
    header: any
    headerStart: number
    text: string
    file: Blob
    fileName: string
    name: string
    end: number
}


export const Multipart = {
    parse: (function () {

        function buf2String(buf: Uint8Array): string {
            let string = '';
            buf.forEach(function (byte) {
                string += String.fromCharCode(byte);
            });
            return string;
        }

        function processSections(arraybuf: Uint8Array, sections: ISection[]): ISection[] {
            for (let i = 0; i !== sections.length; ++i) {
                const section = sections[i];
                if (section.header['content-type'] === 'text/plain') {
                    section.text = buf2String(arraybuf.slice(section.bodyStart, section.end));
                } else {
                    const imgData = arraybuf.slice(section.bodyStart, section.end);
                    section.file = new Blob([imgData], {
                        type: section.header['content-type']
                    });
                    const fileNameMatching = (/\bfilename\=\"([^\"]*)\"/g).exec(section.header['content-disposition']) || [];
                    section.fileName = fileNameMatching[1] || '';
                }
                const matching = (/\bname\=\"([^\"]*)\"/g).exec(section.header['content-disposition']) || [];
                section.name = matching[1] || '';

                delete section.headerStart;
                delete section.bodyStart;
                delete section.end;
            }

            return sections;
        }

        function multiparts(arraybuf: Uint8Array, boundary: string) {
            boundary = '--' + boundary;
            const parser = new Parser(arraybuf, boundary);

            let sections: ISection[] = [];
            while (parser.skipPastNextBoundary()) {
                const header = parser.parseHeader();

                if (header !== null) {
                    const headerLength = header.length;
                    const headerParts = header.trim().split('\n');

                    const headerObj: any = {};
                    for (let i = 0; i !== headerParts.length; ++i) {
                        const parts = headerParts[i].split(':');
                        headerObj[parts[0].trim().toLowerCase()] = (parts[1] || '').trim();
                    }

                    sections.push({
                        end: 0, file: new Blob(), fileName: "", name: "", text: "",
                        'bodyStart': parser.i,
                        'header': headerObj,
                        'headerStart': parser.i - headerLength
                    });
                }
            }

            // add dummy section for end
            sections.push({
                bodyStart: 0, end: 0, file: new Blob(), fileName: "", header: undefined, name: "", text: "",
                'headerStart': arraybuf.byteLength - boundary.length - 2 // 2 hyphens at end
            });
            for (let i = 0; i !== sections.length - 1; ++i) {
                sections[i].end = sections[i + 1].headerStart - boundary.length;

                if (String.fromCharCode(arraybuf[sections[i].end]) === '\r' || '\n') {
                    sections[i].end -= 1;
                }
                if (String.fromCharCode(arraybuf[sections[i].end]) === '\r' || '\n') {
                    sections[i].end -= 1;
                }
            }
            // remove dummy section
            sections.pop();

            sections = processSections(arraybuf, sections);

            return sections;
        }

        return multiparts;
    })()
};
