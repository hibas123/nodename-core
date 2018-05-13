"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const binary_parser_1 = require("binary-parser");
const types_1 = require("./types");
const MAX_LABEL_SIZE = 63;
var QueryTypes;
(function (QueryTypes) {
    /**
     * IPv4 address
     */
    QueryTypes[QueryTypes["A"] = 1] = "A";
    /**
     * Nameserver
     */
    QueryTypes[QueryTypes["NS"] = 2] = "NS";
    /**
     * Obsolete
     */
    QueryTypes[QueryTypes["MD"] = 3] = "MD";
    /**
     * Obsolete
     */
    QueryTypes[QueryTypes["MF"] = 4] = "MF";
    /**
     * Alias
     */
    QueryTypes[QueryTypes["CNAME"] = 5] = "CNAME";
    /**
     * Start of authority
     */
    QueryTypes[QueryTypes["SOA"] = 6] = "SOA";
    /**
     * Experimental
     */
    QueryTypes[QueryTypes["MB"] = 7] = "MB";
    /**
     * Experimental
     */
    QueryTypes[QueryTypes["MG"] = 8] = "MG";
    /**
     * Experimental
     */
    QueryTypes[QueryTypes["MR"] = 9] = "MR";
    /**
     * Experimental
     */
    QueryTypes[QueryTypes["NULL"] = 10] = "NULL";
    /**
     * Service description
     */
    QueryTypes[QueryTypes["WKS"] = 11] = "WKS";
    /**
     * Reverse entry (inaddr.arpa)
     */
    QueryTypes[QueryTypes["PTR"] = 12] = "PTR";
    /**
     * Host information
     */
    QueryTypes[QueryTypes["HINFO"] = 13] = "HINFO";
    /**
     * Mailbox / Mail-list information
     */
    QueryTypes[QueryTypes["MINFO"] = 14] = "MINFO";
    /**
     * Mail exchange
     */
    QueryTypes[QueryTypes["MX"] = 15] = "MX";
    /**
     * Text strings
     */
    QueryTypes[QueryTypes["TXT"] = 16] = "TXT";
    /**
     * IPv6 address
     */
    QueryTypes[QueryTypes["AAAA"] = 28] = "AAAA";
    /**
     * SRV records
     */
    QueryTypes[QueryTypes["SRV"] = 33] = "SRV";
    /**
     * Request to transfer entire zone
     */
    QueryTypes[QueryTypes["AXFR"] = 252] = "AXFR";
    /**
     * Request for mailbox related records
     */
    QueryTypes[QueryTypes["MAILA"] = 254] = "MAILA";
    /**
     * Request for mail agend RRs
     */
    QueryTypes[QueryTypes["MAILB"] = 253] = "MAILB";
    /**
     * Any class
     */
    QueryTypes[QueryTypes["ANY"] = 255] = "ANY";
})(QueryTypes = exports.QueryTypes || (exports.QueryTypes = {}));
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
    return new binary_parser_1.Parser()
        .endianess("big")
        .array("questions", {
        type: questionParser,
        length: count
    }).parse(packet).questions;
}
class Request {
    constructor(packet, sendCallback) {
        this.sendCallback = sendCallback;
        this.answers = [];
        this.authorities = [];
        this.additionals = [];
        this._packet = packet;
        let headerData = Buffer.alloc(12);
        packet.copy(headerData, 0, 0, 12);
        let bodyData = Buffer.alloc(packet.length - 12);
        packet.copy(bodyData, 0, 12, packet.length);
        this._header = headerParser.parse(headerData);
        this._header.AD = 0;
        this._header.RCODE = types_1.ErrorCodes.NoError;
        this._questions = parseQuestions(this._header.QDCOUNT, bodyData);
    }
    get header() {
        return Object.assign({}, this._header);
    }
    get questions() {
        return this._questions.map(e => e);
    }
    error(error) {
        if (this._header.RCODE === types_1.ErrorCodes.NoError)
            this._header.RCODE = error;
    }
    send() {
        this.sendCallback(this.serialize());
    }
    serialize(truncate = false, rcode = 0) {
        this._header.AA = 1;
        this._header.ANCOUNT = this.answers.length;
        this._header.ARCOUNT = this.additionals.length;
        this._header.NSCOUNT = this.authorities.length;
        this._header.QR = 1;
        this._header.RCODE = rcode;
        this._header.RA = 0;
        let questions = this.questions.map(this.serializeQuestion, this);
        let answers = this.answers.map(this.serializeResourceRecord, this);
        let authority = this.authorities.map(this.serializeResourceRecord, this);
        let additional = this.additionals.map(this.serializeResourceRecord, this);
        let questionsByteLength = 0;
        questions.forEach(e => questionsByteLength += e.length);
        let answersByteLength = 0;
        answers.forEach(e => answersByteLength += e.length);
        let authorityByteLength = 0;
        authority.forEach(e => authorityByteLength += e.length);
        let additionalByteLength = 0;
        additional.forEach(e => additionalByteLength += e.length);
        let length = 12 + questionsByteLength + answersByteLength + authorityByteLength + additionalByteLength; //Header is always 12 byte large
        if (truncate && length > 512) {
            this._header.TC = 1;
            //Buffer will ignore data that exeeds the max buffer length
            length = 512;
        }
        let header = this.serializeHeader();
        let data = Buffer.alloc(length);
        let offset = 0;
        let append = (buffer) => {
            buffer.copy(data, offset, 0, buffer.length);
            offset += buffer.length;
        };
        append(header);
        questions.forEach(append);
        answers.forEach(append);
        authority.forEach(append);
        additional.forEach(append);
        return data;
    }
    serializeHeader() {
        let header = this.header;
        let data = Buffer.alloc(12);
        data.writeUInt16BE(header.ID, 0);
        var f = 0x0000;
        f = f | (header.QR << 15);
        f = f | (header.OPCODE << 11);
        f = f | (header.AA << 10);
        f = f | (header.TC << 9);
        f = f | (header.RD << 8);
        f = f | (header.RA << 7);
        f = f | (header.Z << 6);
        f = f | (header.AD << 5);
        f = f | (header.CD << 4);
        f = f | header.RCODE;
        data.writeUInt16BE(f, 2);
        data.writeUInt16BE(header.QDCOUNT, 4);
        data.writeUInt16BE(header.ANCOUNT, 6);
        data.writeUInt16BE(header.NSCOUNT, 8);
        data.writeUInt16BE(header.ARCOUNT, 10);
        return data;
    }
    serializeQuestion(question) {
        let qname = this.serializeName(question.QNAME);
        let data = Buffer.alloc(qname.length + 4);
        qname.copy(data, 0, 0, qname.length);
        let offset = qname.length;
        data.writeUInt16BE(question.QTYPE, offset);
        offset += 2;
        data.writeUInt16BE(question.QCLASS, offset);
        return data;
    }
    serializeResourceRecord(record) {
        // TODO: Implement compression
        let name = this.serializeName(record.NAME);
        let data = Buffer.alloc(name.length + 10 + record.RDLENGTH); // For TYPE, CLASS, TTL, RLENGTH
        name.copy(data, 0, 0, name.length);
        let offset = name.length;
        data.writeUInt16BE(record.TYPE, offset);
        offset += 2;
        data.writeUInt16BE(record.CLASS, offset);
        offset += 2;
        data.writeUInt32BE(record.TTL, offset);
        offset += 4;
        data.writeUInt16BE(record.RDLENGTH, offset);
        offset += 2;
        record.RDATA.copy(data, offset, 0, record.RDLENGTH);
        return data;
    }
    serializeName(name) {
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
}
exports.Request = Request;
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
    }
    get TTL() {
        return this._TTL;
    }
    get RDLENGTH() {
        return this.RDATA.length;
    }
}
exports.RecourceRecord = RecourceRecord;
//# sourceMappingURL=request.js.map