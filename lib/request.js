"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binary_parser_1 = require("binary-parser");
const types_1 = require("./types");
const headerParser = new binary_parser_1.Parser()
    .endianess("big")
    .uint16("ID")
    .bit1("QR")
    .bit4("OPCODE")
    .bit1("AA")
    .bit1("TC")
    .bit1("RD")
    .bit1("RA")
    .bit1("Z")
    .bit1("AD")
    .bit1("CD")
    .bit4("RCODE")
    .uint16("QDCOUNT")
    .uint16("ANCOUNT")
    .uint16("NSCOUNT")
    .uint16("ARCOUNT");
function parseHeader(data) {
    try {
        return headerParser.parse(data);
    }
    catch (e) {
        throw new Error("Header parsing failed" + e.message);
    }
}
exports.parseHeader = parseHeader;
const labelParser = new binary_parser_1.Parser()
    .endianess("big")
    .uint8("dataLength")
    .string("name", {
    length: "dataLength",
    encoding: "ascii"
});
const questionParser = new binary_parser_1.Parser()
    .endianess("big")
    .array("QNAME", {
    type: labelParser,
    readUntil: (item, buffer) => {
        if (item.dataLength <= 0)
            return true;
    },
    formatter: (value) => {
        return value.map(e => e.name).join(".").slice(0, -1);
    }
})
    .uint16("QTYPE")
    .uint16("QCLASS");
function parseQuestions(count, packet) {
    try {
        return new binary_parser_1.Parser()
            .endianess("big")
            .array("questions", {
            type: questionParser,
            length: count
        }).parse(packet).questions;
    }
    catch (e) {
        throw new Error("Question parsing failed" + e.message);
    }
}
exports.parseQuestions = parseQuestions;
const MAX_LABEL_SIZE = 63;
function serializeName(name) {
    let length = 0;
    let parts = name.split(".");
    parts.forEach(e => {
        // Length of part and byte that holds the length information
        if (e.length > MAX_LABEL_SIZE)
            throw new Error("Label to large");
        length += e.length + 1;
    });
    length += 1; //Adding last 0 length octet
    let data = Buffer.alloc(length);
    let offset = 0;
    parts.forEach(e => {
        data.writeUInt8(e.length, offset);
        offset++;
        data.write(e, offset, e.length);
        offset += e.length;
    });
    data.writeUInt8(0, offset);
    return data;
}
exports.serializeName = serializeName;
class Request {
    constructor(packet, sendCallback, max_size = 512) {
        this.sendCallback = sendCallback;
        this.max_size = max_size;
        this.answers = [];
        this.authorities = [];
        this.additionals = [];
        let headerData = Buffer.alloc(12);
        packet.copy(headerData, 0, 0, 12);
        let bodyData = Buffer.alloc(packet.length - 12);
        packet.copy(bodyData, 0, 12, packet.length);
        this._header = new Header(parseHeader(headerData));
        this._header.AD = 0;
        this._header.RCODE = types_1.ErrorCodes.NoError;
        this._header.RA = this._header.RD;
        this._questions = parseQuestions(this._header.QDCOUNT, bodyData).map(e => new Question(e));
    }
    get header() {
        return Object.assign({}, this._header);
    }
    get questions() {
        return this._questions.map(e => Object.assign({}, e));
    }
    error(error) {
        if (this._header.RCODE === types_1.ErrorCodes.NoError)
            this._header.RCODE = error;
    }
    noRecursion() {
        this._header.RA = 0;
    }
    send() {
        this.sendCallback(this.serialize());
    }
    serialize() {
        this._header.AA = 1;
        this._header.ANCOUNT = this.answers.length;
        this._header.ARCOUNT = this.additionals.length;
        this._header.NSCOUNT = this.authorities.length;
        this._header.QR = 1;
        let questions = this._questions.map(e => e.serialize());
        let answers = this.answers.map(e => e.serialize());
        let authority = this.authorities.map(e => e.serialize());
        let additional = this.additionals.map(e => e.serialize());
        let length = 12;
        questions.forEach(e => length += e.length);
        answers.forEach(e => length += e.length);
        authority.forEach(e => length += e.length);
        additional.forEach(e => length += e.length);
        // let questionsByteLength = 0;
        // questions.forEach(e => questionsByteLength += e.length);
        // let answersByteLength = 0;
        // answers.forEach(e => answersByteLength += e.length)
        // let authorityByteLength = 0;
        // authority.forEach(e => authorityByteLength += e.length)
        // let additionalByteLength = 0;
        // additional.forEach(e => additionalByteLength += e.length)
        // let length = 12 + questionsByteLength + answersByteLength + authorityByteLength + additionalByteLength; //Header is always 12 byte large
        if (length > this.max_size) {
            this._header.TC = 1;
            //Will ignore data, that exceeds length
            length = this.max_size;
        }
        let header = this._header.serialize();
        let data = Buffer.alloc(length);
        let offset = 0;
        let append = (buffer) => {
            if (offset <= length) {
                buffer.copy(data, offset, 0, buffer.length);
                offset += buffer.length;
            }
        };
        append(header);
        questions.forEach(append);
        answers.forEach(append);
        authority.forEach(append);
        additional.forEach(append);
        return data;
    }
}
exports.Request = Request;
class Header {
    constructor(header) {
        for (let k in header) {
            this[k] = header[k];
        }
    }
    serialize() {
        let data = Buffer.alloc(12);
        data.writeUInt16BE(this.ID, 0);
        var f = 0x0000;
        f = f | (this.QR << 15);
        f = f | (this.OPCODE << 11);
        f = f | (this.AA << 10);
        f = f | (this.TC << 9);
        f = f | (this.RD << 8);
        f = f | (this.RA << 7);
        f = f | (this.Z << 6);
        f = f | (this.AD << 5);
        f = f | (this.CD << 4);
        f = f | this.RCODE;
        data.writeUInt16BE(f, 2);
        data.writeUInt16BE(this.QDCOUNT, 4);
        data.writeUInt16BE(this.ANCOUNT, 6);
        data.writeUInt16BE(this.NSCOUNT, 8);
        data.writeUInt16BE(this.ARCOUNT, 10);
        return data;
    }
}
exports.Header = Header;
class Question {
    constructor(question) {
        for (let k in question) {
            this[k] = question[k];
        }
    }
    serialize() {
        let qname = serializeName(this.QNAME);
        let data = Buffer.alloc(qname.length + 4);
        qname.copy(data, 0, 0, qname.length);
        let offset = qname.length;
        data.writeUInt16BE(this.QTYPE, offset);
        offset += 2;
        data.writeUInt16BE(this.QCLASS, offset);
        return data;
    }
}
exports.Question = Question;
class RecourceRecord {
    set TYPE(value) {
        if (value < 0 || value > 65535)
            throw new TypeError("TYPE Range: 0 - 65.535");
        this._TYPE = value;
    }
    get TYPE() {
        return this._TYPE;
    }
    set CLASS(value) {
        if (value < 0 || value > 65535)
            throw new TypeError("CLASS Range: 0 - 65.535");
        this._CLASS = value;
    }
    get CLASS() {
        return this._CLASS;
    }
    set TTL(value) {
        if (value < 0 || value > 4294967295)
            throw new TypeError("TTL Range: 0 - 4.294.967.295");
        this._TTL = value;
    }
    get TTL() {
        return this._TTL;
    }
    get RDLENGTH() {
        return this.RDATA.length;
    }
    serialize() {
        // TODO: Implement compression
        let name = serializeName(this.NAME);
        let data = Buffer.alloc(name.length + 10 + this.RDLENGTH); // For TYPE, CLASS, TTL, RLENGTH
        name.copy(data, 0, 0, name.length);
        let offset = name.length;
        data.writeUInt16BE(this.TYPE, offset);
        offset += 2;
        data.writeUInt16BE(this.CLASS, offset);
        offset += 2;
        data.writeUInt32BE(this._TTL, offset);
        offset += 4;
        data.writeUInt16BE(this.RDLENGTH, offset);
        offset += 2;
        this.RDATA.copy(data, offset, 0, this.RDLENGTH);
        return data;
    }
}
exports.RecourceRecord = RecourceRecord;
//# sourceMappingURL=request.js.map